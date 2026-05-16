from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    message: str


class SourceReference(BaseModel):
    filename: str
    chunk_index: int
    score: Optional[float] = None
    preview: Optional[str] = None


class QueryRequest(BaseModel):
    question: str

    collection_name: str = "default_collection"

    top_k: int = Field(
        default=10,
        ge=1,
        le=20
    )

    project_id: Optional[str] = None

    chat_history: List[ChatMessage] = Field(
        default_factory=list
    )


class QueryResponse(BaseModel):
    answer: str

    sources: List[SourceReference]

    retrieved_chunks: Optional[int] = 0

    reranked_chunks: Optional[int] = 0


class IngestTextRequest(BaseModel):

    text: str

    filename: str

    project_id: Optional[str] = None

    collection_name: str = "default_collection"

    metadata: Dict[str, Any] = Field(
        default_factory=dict
    )


class IngestResponse(BaseModel):

    status: str

    file_name: str

    chunks_created: int

    collection_name: str


class CollectionCreateRequest(BaseModel):
    name: str


class CollectionResponse(BaseModel):
    status: str
    collection: str


class HealthResponse(BaseModel):
    status: str
    collections: int


class StatsResponse(BaseModel):

    collection_name: str

    total_chunks: int

    total_vectors: int

    last_ingested_file: Optional[str] = None