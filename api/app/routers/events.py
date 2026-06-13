from typing import Any, cast

from fastapi import APIRouter, HTTPException, status

from app.database import supabase
from app.schemas.events import EventCreate, EventUpdate

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_events(
    field_id: int | None = None,
    project_id: int | None = None,
    type_str: str | None = None,
):
    """
    Retrieve calendar schedule blocks matching filter conditions.
    """
    query = supabase.table("events").select("*")

    if field_id is not None:
        query = query.eq("field_id", field_id)
    if project_id is not None:
        query = query.eq("project_id", project_id)
    if type_str is not None:
        query = query.eq("type", type_str)

    result = query.execute().data
    if isinstance(result, list):
        return [item for item in result if isinstance(item, dict)]
    return []


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_event(event_data: EventCreate):
    """
    Schedule a new time block allocation and audit the event footprint.
    """
    from app.services.moments import create_moment

    payload = event_data.model_dump(exclude={"moment_note"})
    result = supabase.table("events").insert(payload).execute().data

    if isinstance(result, list) and result:
        first_item = cast(dict[str, Any], result[0])
        event_id = first_item["id"]

        if event_data.task_id and event_data.type == "plan":
            moment_payload = {
                "entity_type": "task",
                "entity_id": event_data.task_id,
                "event_type": "scheduled",
                "value": f"{event_data.start_at} → {event_data.end_at}",
                "moment_note": event_data.moment_note,
            }
            create_moment(moment_payload)

        full_event = (
            supabase.table("events").select("*").eq("id", event_id).execute().data
        )
        if isinstance(full_event, list) and full_event:
            return cast(dict[str, Any], full_event[0])

    raise HTTPException(status_code=400, detail="Failed to create event")


@router.patch(
    "/{event_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def update_event(event_id: int, event_data: EventUpdate):
    """
    Reschedule or edit event records and log structural shifts within tracking tables.
    """
    from app.services.moments import create_moment

    data = event_data.model_dump(exclude={"moment_note"}, exclude_none=True)
    result = supabase.table("events").update(data).eq("id", event_id).execute().data

    if isinstance(result, list) and result:
        event_query = (
            supabase.table("events").select("*").eq("id", event_id).execute().data
        )
        if isinstance(event_query, list) and event_query:
            event = cast(dict[str, Any], event_query[0])

            if event_data.start_at or event_data.end_at:
                start = event_data.start_at or event.get("start_at")
                end = event_data.end_at or event.get("end_at")

                if event.get("task_id") and event.get("type") == "plan":
                    moment_payload = {
                        "entity_type": "task",
                        "entity_id": event["task_id"],
                        "event_type": "scheduled",
                        "value": f"{start} → {end}",
                        "moment_note": event_data.moment_note,
                    }
                else:
                    moment_payload = {
                        "entity_type": "event",
                        "entity_id": event_id,
                        "event_type": "scheduled",
                        "value": f"{start} → {end}",
                        "moment_note": event_data.moment_note,
                    }
                create_moment(moment_payload)
            return event

    raise HTTPException(status_code=404, detail="Event not found")
