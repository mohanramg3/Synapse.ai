from app.services.documents.extractor import extract_text

from app.services.rag.keyword_rag import (
    create_chunks,
    save_chunks
)

from app.services.ai.analyze_service import analyze_project


def process_document(
    project_id,
    file_path
):

    text = extract_text(file_path)

    chunks = create_chunks(text)

    save_chunks(project_id, chunks)

    analyze_project(project_id, chunks)