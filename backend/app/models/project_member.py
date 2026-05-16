from sqlalchemy import Column, Integer, ForeignKey, String
from app.core.database import Base


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"))

    user_id = Column(Integer, ForeignKey("users.id"))

    role = Column(String, default="MEMBER")