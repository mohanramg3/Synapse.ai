from app.models.chat_message import ChatMessage

def save_message(db, project_id, user_id, role, message):

    chat = ChatMessage(
        project_id=project_id,
        user_id=user_id,
        role=role,
        message=message
    )

    db.add(chat)
    db.commit()

    return chat


def get_chat_history(db, project_id):

    return db.query(ChatMessage)\
        .filter(ChatMessage.project_id == project_id)\
        .order_by(ChatMessage.created_at.asc())\
        .all()