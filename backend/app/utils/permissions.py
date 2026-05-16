from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.project_member import ProjectMember


def check_project_access(
    db: Session,
    project_id: int,
    user_id: int
):

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return member