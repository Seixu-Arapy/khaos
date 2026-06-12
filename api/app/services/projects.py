from app.database import supabase

PROJECT_SELECT = "*, fields(*)"


def get_full_project(project_id: int) -> dict:
    """
    Queries the database for a single project record, injecting its
    associated operational field relation.
    """
    return (
        supabase
        .table("projects")
        .select(PROJECT_SELECT)
        .eq("id", project_id)
        .single()
        .execute()
        .data
    )


def get_projects(field_id: int | None = None, status: str | None = None) -> list[dict]:
    """
    Queries the database for multiple project records based on optional filters.
    """
    query = supabase.table("projects").select(PROJECT_SELECT)
    if field_id:
        query = query.eq("field_id", field_id)
    if status:
        query = query.eq("status", status)
    return query.execute().data
