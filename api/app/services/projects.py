from typing import Any, cast

from app.database import supabase


def get_projects() -> list[dict[str, Any]]:
    """
    List all projects from the database.

    Returns:
        list[dict[str, Any]]: A list of project objects.
    """
    data = supabase.table("projects").select("*").execute().data

    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_project(project_id: int) -> dict[str, Any]:
    """
    Get a single project by its unique ID.

    Args:
        project_id (int): The primary key database identifier of the project.

    Returns:
        dict[str, Any]: The project object, or an empty dict if not found.
    """
    data = supabase.table("projects").select("*").eq("id", project_id).execute().data

    if isinstance(data, list) and len(data) > 0:
        # Pegamos o primeiro item da lista e garantimos que o Pylance o veja como dict[str, Any]
        return cast(dict[str, Any], data[0])

    return {}


def create_project(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new project record into the database.

    Args:
        payload (dict[str, Any]): The key-value attributes to create the project.

    Returns:
        dict[str, Any]: The newly created project row data.
    """
    data = supabase.table("projects").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_project(project_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update attributes of an existing project row.

    Args:
        project_id (int): The primary key database identifier of the project.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified project row.
    """
    data = (
        supabase
        .table("projects")
        .update(payload)
        .eq("id", project_id)
        .select()
        .execute()
        .data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_project(project_id: int) -> bool:
    """
    Delete a project row from the database by its ID.

    Args:
        project_id (int): The unique identity key of the target project.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("projects").delete().eq("id", project_id).execute().data
    return bool(data)
