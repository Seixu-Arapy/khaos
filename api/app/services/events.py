from app.database import supabase

EVENT_SELECT = (
    "*, tasks(id, name), projects(id, name, fields(id, name)), fields(id, name)"
)


def get_full_event(event_id: int) -> dict:
    """
    Queries a single calendar event block by its unique identifier,
    expanding nested tasks, projects, and domain fields.
    """
    return (
        supabase
        .table("events")
        .select(EVENT_SELECT)
        .eq("id", event_id)
        .single()
        .execute()
        .data
    )


def get_events(
    field_id: int | None = None,
    project_id: int | None = None,
    type_str: str | None = None,
) -> list[dict]:
    """
    Queries database logs for calendar events matching optional layout filters.
    """
    query = supabase.table("events").select(EVENT_SELECT)
    if field_id:
        query = query.eq("field_id", field_id)
    if project_id:
        query = query.eq("project_id", project_id)
    if type_str:
        query = query.eq("type", type_str)
    return query.execute().data
