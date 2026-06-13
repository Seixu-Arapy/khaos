from typing import Any

from app.database import supabase


def get_sections() -> list[dict[str, Any]]:
    """
    List all layout sections from the database.

    Returns:
        list[dict[str, Any]]: A list of section objects, or empty list if none exist.
    """
    data = supabase.table("sections").select("*").execute().data

    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_full_section(section_id: int) -> dict[str, Any]:
    """
    Get a single section by its unique ID.

    Args:
        section_id (int): The primary key database identifier of the section.

    Returns:
        dict[str, Any]: The section object, or an empty dict if not found.
    """
    data = supabase.table("sections").select("*").eq("id", section_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_section(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new section record into the database.

    Args:
        payload (dict[str, Any]): The key-value attributes to create the section.

    Returns:
        dict[str, Any]: The newly created section row data.
    """
    data = supabase.table("sections").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_section(section_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update attributes of an existing section row.

    Args:
        section_id (int): The primary key indicating which row to mutate.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified section row.
    """
    data = (
        supabase
        .table("sections")
        .update(payload)
        .eq("id", section_id)
        .select()
        .execute()
        .data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_section(section_id: int) -> bool:
    """
    Delete a section row from the database by its ID.

    Args:
        section_id (int): The unique identity key of the target section.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("sections").delete().eq("id", section_id).execute().data
    return bool(data)
