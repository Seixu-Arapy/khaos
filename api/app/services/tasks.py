from typing import Any

from app.database import supabase
from app.enums import PriorityEnum, StatusEnum


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


def update_task_status(task_id: int, new_status: StatusEnum) -> dict[str, Any] | None:
    """
    Update a task's status.

    Args:
        task_id (int): ID of the task to update.
        new_status (StatusEnum): New status to apply.

    Raises:
        HTTPException: 500 if database update fails.

    Returns:
        Optional[Dict[str, Any]]: Updated row data, or None if task not found.
    """
    status_value = new_status.value

    response = (
        supabase
        .table("tasks")
        .update({"status": status_value})
        .eq("id", task_id)
        .execute()
    )

    if not response.data:
        return {}

    return {
        "success": True,
        "task_id": task_id,
        "field": "status",
        "updated_value": status_value,
        "data": response.data[0] if isinstance(response.data, list) else response.data,
    }


def uppdate_task_priority(
    task_id: int, new_priority: PriorityEnum
) -> dict[str, Any] | None:
    """
    Update a task's priority.

    Args:
        task_id (int): ID of the task to update.
        new_priority (PriorityEnum): New priority to apply.

    Raises:
        HTTPException: 500 if database update fails.

    Returns:
        Optional[Dict[str, Any]]: Updated row data, or None if task not found.
    """

    priority_value = new_priority.value

    response = (
        supabase
        .table("tasks")
        .update({"priority": priority_value})
        .eq("id", task_id)
        .execute()
    )

    if not response.data:
        return {}

    return {
        "success": True,
        "task_id": task_id,
        "field": "priority",
        "updated_value": priority_value,
        "data": response.data[0] if isinstance(response.data, list) else response.data,
    }
