from typing import Any

from app.database import supabase


def get_events() -> list[dict[str, Any]]:
    """
    List all recorded workflow events from the database.

    Returns:
        list[dict[str, Any]]: A list of event logs.
    """
    data = supabase.table("events").select("*").execute().data

    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]

    return []


def get_full_event(event_id: int) -> dict[str, Any]:
    """
    Get a single recorded workflow event by its unique ID.

    Args:
        event_id (int): The primary key database identifier of the event.

    Returns:
        dict[str, Any]: The complete event record details, or an empty dict if not found.
    """
    data = supabase.table("events").select("*").eq("id", event_id).execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )


def create_event(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insert a new event log row into the database tracker.

    Args:
        payload (dict[str, Any]): Attributes explaining the event contextual metrics.

    Returns:
        dict[str, Any]: The newly inserted event database entity.
    """
    data = supabase.table("events").insert(payload).select().execute().data
    return (
        data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    )
