from datetime import UTC, datetime

from app.database import supabase


def register_moment(
    entity_type: str,
    entity_id: int,
    event_type: str,
    value: str | None = None,
    moment_note: str | None = None,
) -> getattr:
    """
    Persists a system lifecycle state transition event directly into the database audit trail.

    Args:
        entity_type (str): The domain model table target (e.g., 'task', 'project').
        entity_id (int): The unique identity row index matching the target entity.
        event_type (str): The operational lifecycle mutation trigger string (e.g., 'status', 'due').
        value (str, optional): The updated meta-value tracking the transition payload. Defaults to None.
        moment_note (str, optional): Explanatory free-text remarks regarding the context of this change. Defaults to None.

    Returns:
        The raw Supabase execution result object containing dataset payload data indicators.
    """
    return (
        supabase
        .table("moments")
        .insert({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "event_type": event_type,
            "value": value,
            "moment_note": moment_note,
            "time": datetime.now(UTC).isoformat(),
        })
        .execute()
    )
