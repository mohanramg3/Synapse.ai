from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag.keyword_rag import keyword_search

router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)

class RagSearchRequest(BaseModel):
    query: str
    project_id: int | None = None


@router.get("/search")
def search_rag(project_id: int, query: str):

    results = keyword_search(project_id, query)

    return {
        "results": results
    }


@router.post("/search")
def search_rag_post(payload: RagSearchRequest):
    if payload.project_id is None:
        return {"results": []}

    results = keyword_search(payload.project_id, payload.query)

    return {
        "results": results
    }
