from pydantic import BaseModel
from typing import List, Optional

from app.schemas.checklist import ChecklistResponse


class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None



class TaskResponse(BaseModel):

    id: int

    title: str

    description: Optional[str]

    status: str

    priority: str

    checklists: List[ChecklistResponse] = []

    class Config:
        from_attributes = True