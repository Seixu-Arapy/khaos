from typing import Any

from app.database import supabase


def get_tasks_sequences() -> list[dict[str, Any]]:
    """
    List all task dependency links from the database.

    Returns:
        list[dict[str, Any]]: List of links matching predecessor and successor task IDs.
    """
    data = supabase.table("tasks_sequence").select("*").execute().data
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def create_task_sequence(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Create a dependency link where one task must precede another.

    Args:
        payload (dict[str, Any]): Dict containing 'task_previous' and 'task_next' keys.

    Returns:
        dict[str, Any]: The created task sequence record.
    """
    data = supabase.table("tasks_sequence").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def upsert_task_sequence(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Create or update a dependency link between a predecessor and a successor task.

    Args:
        payload (dict[str, Any]): Dict containing 'task_previous' and 'task_next' keys.

    Returns:
        dict[str, Any]: The upserted task sequence record.
    """
    data = supabase.table("tasks_sequence").upsert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_task_sequence(task_previous: int, task_next: int) -> bool:
    """
    Delete the dependency link between two tasks.

    Args:
        task_previous (int): The ID of the predecessor task.
        task_next (int): The ID of the successor task.

    Returns:
        bool: True if the link was deleted, False otherwise.
    """
    data = (
        supabase
        .table("tasks_sequence")
        .delete()
        .eq("task_previous", task_previous)
        .eq("task_next", task_next)
        .execute()
        .data
    )
    return bool(data)


def get_sections_sequences() -> list[dict[str, Any]]:
    """
    List all ordering constraints between layout sections.

    Returns:
        list[dict[str, Any]]: List of sequence links matching section IDs.
    """
    data = supabase.table("sections_sequence").select("*").execute().data
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def create_section_sequence(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Create a directional sequence flow between two section containers.

    Args:
        payload (dict[str, Any]): Dict containing 'section_previous' and 'section_next' keys.

    Returns:
        dict[str, Any]: The created section sequence record.
    """
    data = supabase.table("sections_sequence").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def upsert_section_sequence(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Create or update an ordering constraint between two section containers.

    Args:
        payload (dict[str, Any]): Dict containing 'section_previous' and 'section_next' keys.

    Returns:
        dict[str, Any]: The upserted section sequence record.
    """
    data = supabase.table("sections_sequence").upsert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_section_sequence(section_previous: int, section_next: int) -> bool:
    """
    Delete the sequence configuration between two layout sections.

    Args:
        section_previous (int): The ID of the preceding section.
        section_next (int): The ID of the succeeding section.

    Returns:
        bool: True if the constraint was deleted, False otherwise.
    """
    data = (
        supabase
        .table("sections_sequence")
        .delete()
        .eq("section_previous", section_previous)
        .eq("section_next", section_next)
        .execute()
        .data
    )
    return bool(data)
