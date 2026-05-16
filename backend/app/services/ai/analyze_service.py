import json
import os

from app.services.ai.mistral_service import generate_project_structure


AI_OUTPUT_DIR = "storage/ai_outputs"

os.makedirs(AI_OUTPUT_DIR, exist_ok=True)


def analyze_project(project_id, chunks):

    combined_text = "\n".join(chunks[:15])

    ai_response = generate_project_structure(combined_text)

    parsed_data = ai_response
    save_analysis(project_id, parsed_data)

    return parsed_data


def save_analysis(project_id, data):

    file_path = f"{AI_OUTPUT_DIR}/project_{project_id}.json"

    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)


def load_analysis(project_id):

    file_path = f"{AI_OUTPUT_DIR}/project_{project_id}.json"

    if not os.path.exists(file_path):
        return None

    with open(file_path, "r") as file:
        return json.load(file)

