from datetime import UTC, datetime

from app.database import supabase


def register_moment(
    entity_type: str,
    entity_id: int,
    event_type: str,
    value: str | None = None,
    moment_note: str | None = None,
):
    return (
        supabase
        .table("moments")
        .insert({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "event_type": event_type,
            "value": value,
            "moment_note": moment_note,
            "time": datetime.now(UTC).isoformat(),
        })
        .execute()
    )


def enrich_task(task: dict) -> dict:
    previous = (
        supabase
        .table("tasks_sequence")
        .select("task_previous, tasks!task_previous(id, name)")
        .eq("task_next", task["id"])
        .execute()
        .data
    )
    next_ = (
        supabase
        .table("tasks_sequence")
        .select("task_next, tasks!task_next(id, name)")
        .eq("task_previous", task["id"])
        .execute()
        .data
    )
    task["previous_task"] = previous[0]["tasks"] if previous else None
    task["next_task"] = next_[0]["tasks"] if next_ else None
    return task
