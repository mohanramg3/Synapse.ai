from pydantic import BaseModel
from typing import List,Optional

from app.schemas.module import ModuleResponse




class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str

    class Config:
        from_attributes = True


class ProjectDashboardResponse(BaseModel):

    id: int

    name: str

    description: str

    status: str

    modules: List[ModuleResponse] = []

    class Config:
        from_attributes = True