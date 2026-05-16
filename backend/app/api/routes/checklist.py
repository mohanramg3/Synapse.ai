from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.checklist import ChecklistItem
from app.schemas.checklist import ChecklistCreate, ChecklistUpdate

router = APIRouter(
    prefix="/checklists",
    tags=["Checklists"]
)

def serialize_checklist(item):
    return {
        "id": item.id,
        "task_id": item.task_id,
        "title": item.title,
        "label": item.title,
        "is_completed": item.is_completed,
        "done": item.is_completed,
    }


@router.post("/")
def create_checklist(
    checklist: ChecklistCreate,
    db: Session = Depends(get_db)
):

    item = ChecklistItem(
        task_id=checklist.task_id,
        title=checklist.title
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return serialize_checklist(item)


@router.get("/{task_id}")
def get_task_checklists(
    task_id: int,
    db: Session = Depends(get_db)
):

    items = db.query(ChecklistItem).filter(
        ChecklistItem.task_id == task_id
    ).all()

    return [serialize_checklist(item) for item in items]


@router.patch("/{item_id}")
def update_checklist(
    item_id: int,
    checklist_update: ChecklistUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    update_data = checklist_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return serialize_checklist(item)


@router.delete("/{item_id}")
def delete_checklist(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Checklist item deleted successfully"}
