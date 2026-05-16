from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

def serialize_checklist(item):
    return {
        "id": item.id,
        "title": item.title,
        "label": item.title,
        "is_completed": item.is_completed,
        "done": item.is_completed,
    }


def serialize_task(task):
    return {
        "id": task.id,
        "project_id": task.project_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "module_id": task.module_id,
        "created_at": task.created_at,
        "checklist": [serialize_checklist(item) for item in task.checklists],
    }


@router.post("/")
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
):

    new_task = Task(
        project_id=task.project_id,
        title=task.title,
        description=task.description
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return serialize_task(new_task)


@router.get("/")
def get_tasks(db: Session = Depends(get_db)):
    return [serialize_task(task) for task in db.query(Task).all()]


@router.get("/project/{project_id}")
def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db)
):

    tasks = db.query(Task).filter(
        Task.project_id == project_id
    ).all()

    return [serialize_task(task) for task in tasks]


@router.patch("/{task_id}")
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return serialize_task(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
