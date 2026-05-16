import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.task import Task
from app.models.checklist import ChecklistItem

from app.services.ai.analyze_service import (
    analyze_project,
    load_analysis
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post("/analyze/{project_id}")
def analyze_project_route(
    project_id: int,
    db: Session = Depends(get_db)
):

    chunk_file = f"storage/chunks/project_{project_id}.json"

    with open(chunk_file, "r") as file:
        chunks = json.load(file)

    analysis = analyze_project(project_id, chunks)

    if "tasks" in analysis:

        for task in analysis["tasks"]:

            db_task = Task(
                project_id=project_id,
                title=task.get("title"),
                description=task.get("description"),
                priority=task.get("priority", "MEDIUM")
            )

            db.add(db_task)

        db.commit()

    if "checklists" in analysis:

        tasks = db.query(Task).filter(
            Task.project_id == project_id
        ).all()

        first_task = tasks[0] if tasks else None

        if first_task:

            for item in analysis["checklists"]:

                checklist = ChecklistItem(
                    task_id=first_task.id,
                    title=item.get("title")
                )

                db.add(checklist)

            db.commit()

    return analysis


@router.get("/analysis/{project_id}")
def get_analysis(project_id: int):

    data = load_analysis(project_id)

    return data


@router.get("/summary/{project_id}")
def get_summary(project_id: int):

    data = load_analysis(project_id)

    return {
        "summary": data.get("project_summary")
    }


@router.get("/risks/{project_id}")
def get_risks(project_id: int):

    data = load_analysis(project_id)

    return {
        "risks": data.get("risks", [])
    }


@router.get("/modules/{project_id}")
def get_modules(project_id: int):

    data = load_analysis(project_id)

    return {
        "modules": data.get("modules", [])
    }