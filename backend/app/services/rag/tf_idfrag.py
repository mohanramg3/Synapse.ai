import json

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def tfidf_search(project_id, query):

    file_path = f"storage/chunks/project_{project_id}.json"

    with open(file_path, "r") as file:
        chunks = json.load(file)

    vectorizer = TfidfVectorizer()

    vectors = vectorizer.fit_transform(
        chunks + [query]
    )

    similarities = cosine_similarity(
        vectors[-1],
        vectors[:-1]
    ).flatten()

    results = []

    for i, score in enumerate(similarities):

        results.append({
            "score": float(score),
            "content": chunks[i]
        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:10]