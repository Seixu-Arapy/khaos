from typing import Any

from app.database import supabase


def get_fields() -> list[dict[str, Any]]:
    """
    List all fields from the database.

    Returns:
        list[dict[str, Any]]: A list of field objects.
    """
    data = supabase.table("fields").select("*").execute().data

    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_field(field_id: int) -> dict[str, Any]:
    """
    Get a single field by its unique ID.

    Args:
        field_id (int): The primary key database identifier of the field.

    Returns:
        dict[str, Any]: The field object, or an empty dict if not found.
    """
    data = supabase.table("fields").select("*").eq("id", field_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_field(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new field record into the database.

    Args:
        payload (dict[str, Any]): The key-value attributes to create the field.

    Returns:
        dict[str, Any]: The newly created field row data.
    """
    data = supabase.table("fields").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def update_field(field_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Update attributes of an existing field row.

    Args:
        field_id (int): The primary key database identifier of the field.
        payload (dict[str, Any]): The fields and new values to update.

    Returns:
        dict[str, Any]: The updated state of the modified field row.
    """
    data = (
        supabase
        .table("fields")
        .update(payload)
        .eq("id", field_id)
        .select()
        .execute()
        .data
    )
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def delete_field(field_id: int) -> bool:
    """
    Delete a field row from the database by its ID.

    Args:
        field_id (int): The unique identity key of the target field.

    Returns:
        bool: True if rows were deleted, False otherwise.
    """
    data = supabase.table("fields").delete().eq("id", field_id).execute().data
    return bool(data)
