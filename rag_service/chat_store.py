import json
import os
from datetime import datetime

CHAT_FILE = "chat_history.json"


def load_chat_history():

    if not os.path.exists(CHAT_FILE):
        return []

    with open(CHAT_FILE, "r") as f:
        return json.load(f)


def save_chat_message(
    project_id,
    role,
    message
):

    history = load_chat_history()

    history.append({
        "project_id": project_id,
        "role": role,
        "message": message,
        "timestamp": str(datetime.utcnow())
    })

    with open(CHAT_FILE, "w") as f:
        json.dump(history, f, indent=2)


def get_project_chat_history(
    project_id,
    limit=10
):

    history = load_chat_history()

    filtered = [
        h for h in history
        if h["project_id"] == project_id
    ]

    return filtered[-limit:]