from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.core.database import Base


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)

    task_id = Column(Integer, ForeignKey("tasks.id"))

    title = Column(String, nullable=False)

    is_completed = Column(Boolean, default=False)