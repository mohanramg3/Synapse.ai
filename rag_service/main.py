from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)



from fastapi.middleware.cors import CORSMiddleware

import shutil
import os

from ingest_status import get_status

from chat_store import (
    save_chat_message,
    get_project_chat_history
)



from ingest import (
    ingest_document,
    generate_embeddings,
    ingest_text
)
from retriever import store_chunks
from utils import generate_text_hash
from retriever import (
    client,
    search_chunks,
    mmr_rerank,
    create_collection,
    apply_hybrid_scoring
)

from generator import (
    build_prompt,
    generate_answer
)

from models import (
    QueryRequest
)
from models import (
    QueryRequest,
    IngestTextRequest
)
from config import (
    COLLECTION_NAME,
    MAX_CONTEXT_CHUNKS
)

app = FastAPI()

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Upload Directory
# -----------------------------
UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def home():

    return {
        "message": "RAG Service Running"
    }

# -----------------------------
# COLLECTION MANAGEMENT
# -----------------------------
@app.post("/collection/create")
def create_new_collection(name: str):

    create_collection(name)

    return {
        "status": "created",
        "collection": name
    }

@app.get("/collections")
def list_collections():

    collections = client.get_collections()

    return collections

@app.delete("/collection/{name}")
def delete_collection(name: str):

    client.delete_collection(name)

    return {
        "status": "deleted",
        "collection": name
    }

# -----------------------------
# DOCUMENT INGESTION
# -----------------------------
@app.post("/ingest")
async def ingest(
    file: UploadFile = File(...),
    collection_name: str = Form(COLLECTION_NAME)
):

    try:

        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        result = ingest_document(
            file_path=file_path,
            filename=file.filename,
            collection_name=collection_name
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -----------------------------
# QUERY / CHAT
# -----------------------------
@app.post("/query")
def query(request: QueryRequest):

    try:

        print("\n====================")
        print("QUERY RECEIVED")
        print("====================")
        print("QUESTION:", request.question)

        # -----------------------------------
        # Generate query embedding
        # -----------------------------------

        query_embedding = generate_embeddings(
            [request.question]
        )[0]

        print("EMBEDDING GENERATED")

        # -----------------------------------
        # Vector Search
        # -----------------------------------

        search_results = search_chunks(
            collection_name=request.collection_name,
            query_embedding=query_embedding,
            top_k=request.top_k
        )

        print("SEARCH RESULTS:", len(search_results))

        # -----------------------------------
        # Hybrid Search
        # -----------------------------------

        search_results = apply_hybrid_scoring(
            request.question,
            search_results
        )

        print("HYBRID SCORING DONE")

        # -----------------------------------
        # MMR
        # -----------------------------------

        reranked_results = mmr_rerank(
            query_embedding,
            search_results,
            top_k=MAX_CONTEXT_CHUNKS
        )

        print("MMR DONE")
        print("RERANKED:", len(reranked_results))

        # -----------------------------------
        # Context Build
        # -----------------------------------

        contexts = []
        sources = []

        for result in reranked_results:

            print("RESULT:", result)

            payload = result.payload or {}

            chunk_text = payload.get(
                "text",
                ""
            )

            contexts.append(chunk_text)

            sources.append({
                "filename": payload.get(
                    "filename",
                    "unknown"
                ),
                "chunk_index": payload.get(
                    "chunk_index",
                    0
                ),
                "score": result.payload.get(
                    "hybrid_score",
                    result.score
                ),
                "preview": chunk_text[:200]
            })

        print("CONTEXTS BUILT")

        # -----------------------------------
        # Prompt
        # -----------------------------------

        prompt = build_prompt(
            question=request.question,
            chunks=contexts,
            history=""
        )

        print("PROMPT BUILT")

        # -----------------------------------
        # Generate Answer
        # -----------------------------------

        answer = generate_answer(prompt)

        print("ANSWER GENERATED")

        return {
            "answer": answer,
            "sources": sources
        }

    except Exception as e:

        import traceback

        traceback.print_exc()

        print("\nQUERY ERROR:")
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/health")
def health():

    collections = client.get_collections().collections

    total_collections = len(collections)

    return {
        "status": "healthy",
        "collections": total_collections
    }

# -----------------------------
# INGEST STATUS
# -----------------------------
@app.get("/ingest/status/{filename}")
def ingest_status(filename: str):

    return {
        "filename": filename,
        "status": get_status(filename)
    }

# -----------------------------
# CHAT HISTORY
# -----------------------------
@app.get("/chat/history/{project_id}")
def chat_history(project_id: str):

    history = get_project_chat_history(
        project_id
    )

    return history

@app.post("/ingest-text")
async def ingest_text_route(
    request: IngestTextRequest
):

    try:

        result = ingest_text(
            text=request.text,
            filename=request.filename,
            collection_name=request.collection_name
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

