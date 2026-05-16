import uuid
import numpy as np

from typing import List

from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams,
    Distance,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)

from config import (
    QDRANT_PATH
)

# -----------------------------------
# QDRANT CLIENT
# -----------------------------------

client = QdrantClient(
    path=QDRANT_PATH
)

# -----------------------------------
# COLLECTION MANAGEMENT
# -----------------------------------

def create_collection(collection_name: str):
    """
    Create Qdrant collection
    """

    existing = [
        c.name
        for c in client.get_collections().collections
    ]

    if collection_name in existing:
        return

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=1024,
            distance=Distance.COSINE
        )
    )


def delete_collection(collection_name: str):
    """
    Delete collection
    """

    client.delete_collection(
        collection_name=collection_name
    )


def list_collections():
    """
    List all collections
    """

    collections = client.get_collections()

    return [
        c.name
        for c in collections.collections
    ]


# -----------------------------------
# DUPLICATE DETECTION
# -----------------------------------

def check_duplicate_document(
    collection_name: str,
    text_hash: str
):
    """
    Check whether document already exists
    """

    try:

        results = client.scroll(
            collection_name=collection_name,
            limit=1,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="text_hash",
                        match=MatchValue(
                            value=text_hash
                        )
                    )
                ]
            )
        )

        points = results[0]

        return len(points) > 0

    except Exception:
        return False


# -----------------------------------
# STORE CHUNKS
# -----------------------------------

def store_chunks(
    collection_name: str,
    chunks: List[str],
    embeddings: List[List[float]],
    metadata_list: List[dict]
):
    """
    Store chunks in Qdrant
    """

    if len(chunks) != len(embeddings):

        raise Exception(
            "Chunks and embeddings mismatch"
        )

    points = []

    for idx, chunk in enumerate(chunks):

        embedding = embeddings[idx]

        metadata = metadata_list[idx]

        # ----------------------------
        # SAFETY CHECKS
        # ----------------------------

        if embedding is None:
            continue

        if chunk is None:
            continue

        if len(embedding) == 0:
            continue

        payload = {
            "text": chunk,

            "filename": metadata.get(
                "filename",
                "unknown"
            ),

            "chunk_index": metadata.get(
                "chunk_index",
                idx
            ),

            "project_id": metadata.get(
                "project_id"
            ),

            "collection_name": metadata.get(
                "collection_name",
                collection_name
            ),

            "text_hash": metadata.get(
                "text_hash"
            )
        }

        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload=payload
        )

        points.append(point)

    if not points:

        raise Exception(
            "No valid points to insert"
        )

    client.upsert(
        collection_name=collection_name,
        points=points
    )


# -----------------------------------
# SEARCH CHUNKS
# -----------------------------------

def search_chunks(
    collection_name: str,
    query_embedding: List[float],
    top_k: int = 10
):
    """
    Semantic vector search
    """

    results = client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=top_k,
        with_payload=True,
        with_vectors=True
    )

    return results


# -----------------------------------
# KEYWORD SCORING
# -----------------------------------

def keyword_score(
    query: str,
    text: str
):
    """
    Simple keyword matching
    """

    if not text:
        return 0

    score = 0

    query_words = query.lower().split()

    text_lower = text.lower()

    for word in query_words:

        score += text_lower.count(word)

    # exact phrase boost

    if query.lower() in text_lower:
        score += 5

    return score


# -----------------------------------
# HYBRID SEARCH
# -----------------------------------

def apply_hybrid_scoring(
    query: str,
    results
):

    query_words = set(
        query.lower().split()
    )

    for result in results:

        text = result.payload.get(
            "text",
            ""
        ).lower()

        lexical_score = sum(
            1
            for word in query_words
            if word in text
        )

        vector_score = result.score

        hybrid_score = (
            vector_score * 0.7
            + lexical_score * 0.3
        )

        # STORE INSIDE PAYLOAD
        result.payload["hybrid_score"] = hybrid_score

    results.sort(
        key=lambda x: x.payload.get(
            "hybrid_score",
            0
        ),
        reverse=True
    )

    return results


# -----------------------------------
# COSINE SIMILARITY
# -----------------------------------

def cosine_similarity(
    a,
    b
):
    """
    Safe cosine similarity
    """

    if a is None or b is None:
        return 0

    if len(a) == 0 or len(b) == 0:
        return 0

    a = np.array(a)
    b = np.array(b)

    denominator = (
        np.linalg.norm(a)
        * np.linalg.norm(b)
    )

    if denominator == 0:
        return 0

    return float(
        np.dot(a, b) / denominator
    )


# -----------------------------------
# MMR RERANKING
# -----------------------------------

def mmr_rerank(
    query_embedding,
    results,
    top_k=4,
    lambda_param=0.7
):
    """
    Maximal Marginal Relevance
    """

    if not results:
        return []

    selected = []

    remaining = results.copy()

    while (
        remaining
        and len(selected) < top_k
    ):

        best_candidate = None

        best_score = -999999

        for candidate in remaining:

            # ------------------------
            # SAFETY CHECK
            # ------------------------

            if candidate.vector is None:
                continue

            relevance = cosine_similarity(
                query_embedding,
                candidate.vector
            )

            diversity = 0

            if selected:

                diversity = max([

                    cosine_similarity(
                        candidate.vector,
                        selected_item.vector
                    )

                    for selected_item in selected

                    if selected_item.vector is not None
                ])

            mmr_score = (
                lambda_param * relevance
                - (1 - lambda_param) * diversity
            )

            if mmr_score > best_score:

                best_score = mmr_score

                best_candidate = candidate

        if best_candidate is None:
            break

        selected.append(
            best_candidate
        )

        remaining.remove(
            best_candidate
        )

    return selected


# -----------------------------------
# COLLECTION STATS
# -----------------------------------

def collection_stats(
    collection_name: str
):
    """
    Get collection information
    """

    info = client.get_collection(
        collection_name=collection_name
    )

    return {
        "collection_name": collection_name,
        "vectors_count": info.vectors_count,
        "points_count": info.points_count,
        "status": str(info.status)
    }