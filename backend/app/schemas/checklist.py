from pydantic import BaseModel
from typing import Optional


class ChecklistCreate(BaseModel):
    task_id: int
    title: str  


class ChecklistUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None



class ChecklistResponse(BaseModel):

    id: int

    title: str

    is_completed: bool

    class Config:
        from_attributes = True