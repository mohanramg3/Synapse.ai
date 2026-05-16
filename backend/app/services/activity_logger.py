import json

from app.models.activity_log import ActivityLog


def log_activity(
    db,
    project_id,
    user_id,
    action,
    entity_type,
    entity_id,
    metadata={}
):

    activity = ActivityLog(
        project_id=project_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(metadata)
    )

    db.add(activity)
    db.commit()