from app.database import supabase


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
