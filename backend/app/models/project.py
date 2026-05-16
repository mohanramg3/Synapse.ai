from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship
from app.models.module import Module


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    description = Column(Text)

    status = Column(String, default="PLANNING")

    owner_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task",backref="project",cascade="all, delete")

    documents = relationship("Document",backref="project",cascade="all, delete")

    modules = relationship("Module",backref="project",cascade="all, delete")