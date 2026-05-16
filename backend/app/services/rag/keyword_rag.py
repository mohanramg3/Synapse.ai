import json
import os


def create_chunks(text):

    sections = text.split("\n\n")

    chunks = []

    current_chunk = ""

    for section in sections:

        if len(current_chunk) + len(section) < 1000:

            current_chunk += "\n" + section

        else:

            chunks.append(current_chunk)

            current_chunk = section

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def save_chunks(project_id, chunks):

    os.makedirs("storage/chunks", exist_ok=True)

    file_path = f"storage/chunks/project_{project_id}.json"

    with open(file_path, "w") as file:
        json.dump(chunks, file)

def keyword_search(project_id, query):

    file_path = f"storage/chunks/project_{project_id}.json"

    with open(file_path, "r") as file:
        chunks = json.load(file)

    results = []

    query_words = query.lower().split()

    for chunk in chunks:

        score = 0

        chunk_lower = chunk.lower()

        for word in query_words:

            occurrences = chunk_lower.count(word)

            score += occurrences * 2

        if query.lower() in chunk_lower:
            score += 10

        if "requirements" in chunk_lower:
            score += 3

        if "tasks" in chunk_lower:
            score += 3

        if score > 0:
            results.append({
                "score": score,
                "content": chunk
            })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:10]


def score_chunk(content: str, query: str):

    score = 0

    content_lower = content.lower()
    query_lower = query.lower()

    # Exact phrase boost
    if query_lower in content_lower:
        score += 10

    # Keyword frequency
    words = query_lower.split()

    for word in words:
        score += content_lower.count(word) * 2

    # Heading boost
    important_words = [
        "requirement",
        "authentication",
        "task",
        "module",
        "api",
        "dashboard",
        "risk"
    ]

    for word in important_words:
        if word in content_lower:
            score += 1

    return score