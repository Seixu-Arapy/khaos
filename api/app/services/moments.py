from typing import Any

from app.database import supabase


def get_moments() -> list[dict[str, Any]]:
    """
    List all moments from the database.

    Returns:
        list[dict[str, Any]]: A list of moment objects.
    """
    data = supabase.table("moments").select("*").execute().data

    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_moment(moment_id: int) -> dict[str, Any]:
    """
    Get a single moment by its unique ID.

    Args:
        moment_id (int): The primary key database identifier of the moment.

    Returns:
        dict[str, Any]: The moment object, or an empty dict if not found.
    """
    data = supabase.table("moments").select("*").eq("id", moment_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_moment(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new moment record into the database.

    Args:
        payload (dict[str, Any]): The key-value attributes to create the moment.

    Returns:
        dict[str, Any]: The newly created moment row data.
    """
    data = supabase.table("moments").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_moment(moment_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update attributes of an existing moment row.

    Args:
        moment_id (int): The primary key database identifier of the moment.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified moment row.
    """
    data = (
        supabase
        .table("moments")
        .update(payload)
        .eq("id", moment_id)
        .select()
        .execute()
        .data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_moment(moment_id: int) -> bool:
    """
    Delete a moment row from the database by its ID.

    Args:
        moment_id (int): The unique identity key of the target moment.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("moments").delete().eq("id", moment_id).execute().data
    return bool(data)
