from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./rag_crm.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# IMPORT MODELS
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.checklist import ChecklistItem
from app.models.document import Document
from app.models.project_member import ProjectMember
from app.models.project_member import ProjectMember
from app.models.module import Module
from app.models.activity_log import ActivityLog
from app.models.chat_message import ChatMessage

# CREATE TABLES
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()