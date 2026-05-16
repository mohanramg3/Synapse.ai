import json
import os

STATUS_FILE = "ingest_status.json"


def load_status():

    if not os.path.exists(STATUS_FILE):
        return {}

    with open(STATUS_FILE, "r") as f:
        return json.load(f)


def update_status(
    filename,
    status
):

    data = load_status()

    data[filename] = status

    with open(STATUS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_status(filename):

    data = load_status()

    return data.get(filename, "NOT_FOUND")