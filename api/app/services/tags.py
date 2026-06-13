from typing import Any

from app.database import supabase


def get_tags() -> list[dict[str, Any]]:
    """
    List all tags from the database.

    Returns:
        list[dict[str, Any]]: A list of tag objects.
    """
    data = supabase.table("tags").select("*").execute().data
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_tag(tag_id: int) -> dict[str, Any]:
    """
    Get a single tag by its unique ID.

    Args:
        tag_id (int): The primary key database identifier of the tag.

    Returns:
        dict[str, Any]: The tag object, or an empty dict if not found.
    """
    data = supabase.table("tags").select("*").eq("id", tag_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_tag(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new tag record into the database.

    Args:
        payload (dict[str, Any]): The key-value attributes to create the tag.

    Returns:
        dict[str, Any]: The newly created tag row data.
    """
    data = supabase.table("tags").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_tag(tag_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update attributes of an existing tag row.

    Args:
        tag_id (int): The primary key database identifier of the tag.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified tag row.
    """
    data = (
        supabase.table("tags").update(payload).eq("id", tag_id).select().execute().data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_tag(tag_id: int) -> bool:
    """
    Delete a tag row from the database by its ID.

    Args:
        tag_id (int): The unique identity key of the target tag.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("tags").delete().eq("id", tag_id).execute().data
    return bool(data)
