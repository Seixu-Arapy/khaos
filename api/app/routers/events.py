from fastapi import APIRouter, HTTPException, status

from app.database import supabase
from app.schemas import EventCreate, EventUpdate
from app.services.events import get_events, get_full_event
from app.services.moments import register_moment

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("")
def list_events(
    field_id: int | None = None,
    project_id: int | None = None,
    type_str: str | None = None,
):
    """
    Retrieve calendar schedule blocks.
    """
    return get_events(field_id=field_id, project_id=project_id, type_str=type_str)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_event(event_data: EventCreate):
    """
    Schedule a new time block allocation.
    """
    payload = event_data.model_dump(exclude={"moment_note"})
    result = supabase.table("events").insert(payload).execute().data
    if result:
        event_id = result[0]["id"]
        if event_data.task_id and event_data.type == "plan":
            register_moment(
                "task",
                event_data.task_id,
                "scheduled",
                value=f"{event_data.start_at} → {event_data.end_at}",
                moment_note=event_data.moment_note,
            )
        return get_full_event(event_id)
    raise HTTPException(status_code=400, detail="Failed to create event")


@router.patch("/{event_id}")
def update_event(event_id: int, event_data: EventUpdate):
    """
    Reschedule or edit event details.
    """
    data = event_data.model_dump(exclude={"moment_note"}, exclude_none=True)
    result = supabase.table("events").update(data).eq("id", event_id).execute().data

    if result and (event_data.start_at or event_data.end_at):
        event = supabase.table("events").select("*").eq("id", event_id).execute().data
        if event and event[0].get("task_id") and event[0].get("type") == "plan":
            start = event_data.start_at or event[0]["start_at"]
            end = event_data.end_at or event[0]["end_at"]
            register_moment(
                "task",
                event[0]["task_id"],
                "scheduled",
                value=f"{start} → {end}",
                moment_note=event_data.moment_note,
            )
        else:
            start = event_data.start_at or event[0]["start_at"]
            end = event_data.end_at or event[0]["end_at"]
            register_moment(
                "event",
                event_id,
                "scheduled",
                value=f"{start} → {end}",
                moment_note=event_data.moment_note,
            )
        return get_full_event(event_id)
    raise HTTPException(status_code=404, detail="Event not found")
