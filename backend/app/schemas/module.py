from pydantic import BaseModel
from typing import List

from app.schemas.task import TaskResponse


class ModuleResponse(BaseModel):

    id: int

    name: str

    description: str

    tasks: List[TaskResponse] = []

    class Config:
        from_attributes = True