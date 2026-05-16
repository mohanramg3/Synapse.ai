from app.services.rag.keyword_rag import keyword_search
from app.services.ai.mistral_service import ask_mistral
from app.services.chat.chat_memory import (
    save_message,
    get_chat_history
)

def generate_chat_response(db, project_id: int, user_id: int, query: str):

    # Load conversation history
    history = get_chat_history(db, project_id)

    conversation = "\n".join([
        f"{msg.role}: {msg.message}"
        for msg in history[-10:]
    ])

    # Retrieve chunks
    chunks = keyword_search(
        project_id=project_id,
        query=query
    )

    top_chunks = chunks[:5]

    context = "\n\n".join([
        chunk["content"]
        for chunk in top_chunks
    ])

    prompt = f"""
You are an AI project intelligence assistant.

Use the project context and previous conversation to answer accurately.

PREVIOUS CONVERSATION:
{conversation}

PROJECT CONTEXT:
{context}

USER QUESTION:
{query}

Answer operationally and clearly.
"""

    # Save user message
    save_message(
        db=db,
        project_id=project_id,
        user_id=user_id,
        role="user",
        message=query
    )

    # AI response
    answer = ask_mistral(prompt)

    # Save AI message
    save_message(
        db=db,
        project_id=project_id,
        user_id=user_id,
        role="assistant",
        message=answer
    )

    return {
        "answer": answer,
        "sources": top_chunks
    }