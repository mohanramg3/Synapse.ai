from fastapi import APIRouter

from app.services.ai.mistral_service import (
    generate_project_structure
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.get("/generate")
def generate_ai():

    sample_text = """
    Create authentication module,
    dashboard module,
    task management system,
    notification service
    """

    result = generate_project_structure(sample_text)

    return {
        "result": result
    }