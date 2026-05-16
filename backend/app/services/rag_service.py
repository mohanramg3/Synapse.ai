import httpx

RAG_BASE_URL = "http://127.0.0.1:8002"

# -----------------------------------
# INGEST TEXT
# -----------------------------------

async def ingest_text_to_rag(
    text: str,
    filename: str,
    project_id: str,
    collection_name: str = "default_collection"
):

    payload = {
        "text": text,
        "filename": filename,
        "project_id": project_id,
        "collection_name": collection_name
    }

    async with httpx.AsyncClient() as client:

        response = await client.post(
            f"{RAG_BASE_URL}/ingest-text",
            json=payload,
            timeout=120.0
        )
    
    print("RAG STATUS:", response.status_code)
    print("RAG RESPONSE:", response.text)

    return response.json()

# -----------------------------------
# QUERY RAG
# -----------------------------------

async def query_rag(
    question: str,
    project_id: str,
    collection_name: str = "default_collection"
):

    payload = {
        "question": question,
        "project_id": project_id,
        "collection_name": collection_name,
        "top_k": 5
    }

    async with httpx.AsyncClient() as client:

        response = await client.post(
            f"{RAG_BASE_URL}/query",
            json=payload,
            timeout=120.0
        )

    return response.json()