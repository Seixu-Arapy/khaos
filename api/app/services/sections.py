from app.database import supabase

SECTION_SELECT = "*, projects(id, name, field_id, fields(id, name))"


def get_full_section(section_id: int) -> dict:
    """
    Queries a single board section milestone by its unique identifier,
    expanding its nested parent project container hierarchy.
    """
    return (
        supabase
        .table("sections")
        .select(SECTION_SELECT)
        .eq("id", section_id)
        .single()
        .execute()
        .data
    )


def get_sections(
    project_id: int,
    status_str: str | None = None,
    priority_str: str | None = None,
) -> list[dict]:
    """
    Queries the database for multiple section records matching project filters.
    """
    query = (
        supabase.table("sections").select(SECTION_SELECT).eq("project_id", project_id)
    )
    if status_str:
        query = query.eq("status", status_str)
    if priority_str:
        query = query.eq("priority", priority_str)
    return query.execute().data
