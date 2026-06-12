from app.database import supabase
from app.services.sequences import inject_task_sequences

TASK_SELECT = (
    "*, sections(id, name, project_id, projects(id, name, field_id, fields(id, name)))"
)


def get_full_task(task_id: int) -> dict | None:
    """
    Queries a single operational task by identity row index, expanding
    its structural section ancestor hierarchy and resolving sequence graphs.
    """
    result = (
        supabase
        .table("tasks")
        .select(TASK_SELECT)
        .eq("id", task_id)
        .single()
        .execute()
        .data
    )
    return inject_task_sequences(result) if result else None


def get_tasks(
    section_id: int,
    status_enum: str | None = None,
    priority: str | None = None,
    due: str | None = None,
) -> list[dict]:
    """
    Queries the database for multiple task records matching horizontal timeline filters,
    automatically running the sequence dependency injection pipeline.
    """
    query = supabase.table("tasks").select(TASK_SELECT).eq("section_id", section_id)
    if status_enum:
        query = query.eq("status", status_enum)
    if priority:
        query = query.eq("priority", priority)
    if due:
        query = query.eq("due", due)

    raw_tasks = query.execute().data
    return [inject_task_sequences(task) for task in raw_tasks]
