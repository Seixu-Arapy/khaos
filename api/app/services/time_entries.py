from typing import Any

from app.database import supabase


def get_time_entries() -> list[dict[str, Any]]:
    """
    List all time logging entries from the database.

    Returns:
        list[dict[str, Any]]: A list of time entry objects.
    """
    data = supabase.table("time_entries").select("*").execute().data
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    return []


def get_time_entry(entry_id: int) -> dict[str, Any]:
    """
    Get a single time logging entry by its unique ID.

    Args:
        entry_id (int): The primary key database identifier of the time entry.

    Returns:
        dict[str, Any]: The time entry object, or an empty dict if not found.
    """
    data = supabase.table("time_entries").select("*").eq("id", entry_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_time_entry(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new time logging entry record into the database.

    Args:
        payload (dict[str, Any]): The key-value attributes to create the time entry.

    Returns:
        dict[str, Any]: The newly created time entry row data.
    """
    data = supabase.table("time_entries").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_time_entry(entry_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update attributes of an existing time logging entry row.

    Args:
        entry_id (int): The primary key database identifier of the time entry.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified time entry row.
    """
    data = (
        supabase
        .table("time_entries")
        .update(payload)
        .eq("id", entry_id)
        .select()
        .execute()
        .data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_time_entry(entry_id: int) -> bool:
    """
    Delete a time logging entry row from the database by its ID.

    Args:
        entry_id (int): The unique identity key of the target time entry.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("time_entries").delete().eq("id", entry_id).execute().data
    return bool(data)
