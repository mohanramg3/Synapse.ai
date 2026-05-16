import os
import shutil

from fastapi import APIRouter, UploadFile, File, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.document import Document
from app.models.user import User
from app.services.documents.extractor import extract_text
from app.services.rag.keyword_rag import (
    create_chunks,
    save_chunks
)

from app.services.rag_service import (
    ingest_text_to_rag
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_DIR = "storage/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def serialize_document(document):
    return {
        "id": document.id,
        "project_id": document.project_id,
        "uploaded_by": document.uploaded_by,
        "name": document.original_name,
        "original_name": document.original_name,
        "file_path": document.file_path,
        "file_type": document.file_type,
        "status": document.processing_status,
        "processing_status": document.processing_status,
        "created_at": document.created_at,
        "processing_error": document.processing_error,
    }


@router.get("/")
def list_documents(
    project_id: int | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if project_id is not None:
        query = query.filter(Document.project_id == project_id)
    return [serialize_document(document) for document in query.order_by(Document.created_at.desc()).all()]


@router.post("/upload")
def upload_document(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        project_id=project_id,
        uploaded_by=current_user.id,
        original_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        processing_status="PROCESSING"
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        text = extract_text(file_path)
        chunks = create_chunks(text)
        save_chunks(project_id, chunks)
        document.processing_status = "READY"

    except Exception as exc:
        document.processing_status = "FAILED"
        document.processing_error = str(exc)
    db.commit()
    db.refresh(document)

    return {
        "message": "File uploaded successfully",
        "document": serialize_document(document)
    }


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Try to delete the physical file
    if document.file_path and os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception:
            pass # Continue even if file removal fails
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}


