from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.core.security import get_current_user
from app.models.user import User
from app.models.project_member import ProjectMember

from app.models.project_member import ProjectMember
from app.models.user import User
from app.core.security import get_current_user
from app.utils.permissions import check_project_access

from app.schemas.project import ProjectDashboardResponse
from app.models.activity_log import ActivityLog

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
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
        "checklists": [serialize_checklist(item) for item in task.checklists],
    }


def serialize_module(module):
    return {
        "id": module.id,
        "project_id": module.project_id,
        "name": module.name,
        "description": module.description,
        "tasks": [serialize_task(task) for task in module.tasks],
    }


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
    }


def serialize_project(project, include_children=False):
    payload = {
        "id": project.id,
        "name": project.name,
        "title": project.name,
        "description": project.description,
        "status": project.status,
        "created_at": project.created_at,
        "task_count": len(project.tasks),
        "document_count": len(project.documents),
    }
    if include_children:
        payload.update({
            "tasks": [serialize_task(task) for task in project.tasks],
            "documents": [serialize_document(document) for document in project.documents],
            "modules": [serialize_module(module) for module in project.modules],
        })
    return payload


@router.post("/")
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_project = Project(
        name=project.name,
        description=project.description,
        owner_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    member = ProjectMember(
        project_id=new_project.id,
        user_id=current_user.id,
        role="OWNER"
    )

    db.add(member)
    db.commit()

    return serialize_project(new_project)

@router.get("/")
def get_projects(db: Session = Depends(get_db)):

    projects = db.query(Project).all()

    return [serialize_project(project) for project in projects]


@router.get("/me")
def my_projects(
    current_user: User = Depends(get_current_user)
):

    return current_user


@router.get("/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    return serialize_project(project, include_children=True) if project else None


@router.post("/{project_id}/invite")
def invite_member(
    project_id: int,
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    check_project_access(
        db,
        project_id,
        current_user.id
    )

    member = ProjectMember(
        project_id=project_id,
        user_id=user_id,
        role=role
    )

    db.add(member)
    db.commit()

    return {
        "message": "Member added"
    }



@router.get("/{project_id}/dashboard")
def get_dashboard(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    return serialize_project(project, include_children=True) if project else None


@router.patch("/{project_id}")
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if project.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only the owner can update the project")

    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return serialize_project(project)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has access (OWNER role usually required for delete)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only the owner can delete the project")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
