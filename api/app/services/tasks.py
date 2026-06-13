from typing import Any

from app.database import supabase


def get_tasks() -> list[dict[str, Any]]:
    """
    List all tasks stored across the system.

    Returns:
        list[dict[str, Any]]: A list of task objects.
    """
    data = supabase.table("tasks").select("*").execute().data
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_task(task_id: int) -> dict[str, Any]:
    """
    Get a single task matching the provided ID.

    Args:
        task_id (int): The unique identifier of the target task.

    Returns:
        dict[str, Any]: The task data object, or an empty dict if not found.
    """
    data = supabase.table("tasks").select("*").eq("id", task_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_task(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new task node into the database.

    Args:
        payload (dict[str, Any]): Attributes defining the configuration of the task.

    Returns:
        dict[str, Any]: The newly created task row data.
    """
    data = supabase.table("tasks").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_task(task_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update fields of a specific task record.

    Args:
        task_id (int): The task ID to update.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified task row.
    """
    data = (
        supabase
        .table("tasks")
        .update(payload)
        .eq("id", task_id)
        .select()
        .execute()
        .data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_task(task_id: int) -> bool:
    """
    Delete a task row from the database by its ID.

    Args:
        task_id (int): The unique reference key of the task to delete.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("tasks").delete().eq("id", task_id).execute().data
    return bool(data)
