from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship
from app.models.task import Task


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("projects.id"))

    name = Column(String)

    description = Column(Text)
    
    tasks = relationship("Task",backref="module",cascade="all, delete")