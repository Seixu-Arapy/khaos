from fastapi import APIRouter

from app.database import supabase
from app.moments import register_moment

router = APIRouter(prefix="/events", tags=["Events"])

EVENT_SELECT = (
    "*, tasks(id, name), projects(id, name, fields(id, name)), fields(id, name)"
)


def get_full_event(event_id: int):
    return (
        supabase
        .table("events")
        .select(EVENT_SELECT)
        .eq("id", event_id)
        .single()
        .execute()
        .data
    )


@router.get("")
def list_events(
    field_id: int | None = None,
    project_id: int | None = None,
    type: str | None = None,
):
    query = supabase.table("events").select(EVENT_SELECT)
    if field_id:
        query = query.eq("field_id", field_id)
    if project_id:
        query = query.eq("project_id", project_id)
    if type:
        query = query.eq("type", type)
    return query.execute().data


@router.post("")
def create_event(
    title: str,
    type: str,
    start_at: str,
    end_at: str,
    task_id: int | None = None,
    project_id: int | None = None,
    field_id: int | None = None,
    recurrent: bool = False,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("events")
        .insert({
            "title": title,
            "type": type,
            "start_at": start_at,
            "end_at": end_at,
            "task_id": task_id,
            "project_id": project_id,
            "field_id": field_id,
            "recurrent": recurrent,
        })
        .execute()
        .data
    )
    if result:
        event_id = result[0]["id"]
        register_moment(
            "event", event_id, "created", value=title, moment_note=moment_note
        )
        if task_id and type == "plan":
            register_moment(
                "task",
                task_id,
                "scheduled",
                value=f"{start_at} → {end_at}",
                moment_note=moment_note,
            )
        return get_full_event(event_id)
    return result


@router.patch("/{event_id}")
def update_event(
    event_id: int,
    title: str | None = None,
    start_at: str | None = None,
    end_at: str | None = None,
    recurrent: bool | None = None,
    moment_note: str | None = None,
):
    data = {}
    if title:
        data["title"] = title
    if start_at:
        data["start_at"] = start_at
    if end_at:
        data["end_at"] = end_at
    if recurrent is not None:
        data["recurrent"] = recurrent
    result = supabase.table("events").update(data).eq("id", event_id).execute().data
    if result and (start_at or end_at):
        event = supabase.table("events").select("*").eq("id", event_id).execute().data
        if event and event[0].get("task_id") and event[0].get("type") == "plan":
            register_moment(
                "task",
                event[0]["task_id"],
                "scheduled",
                value=f"{start_at} → {end_at}",
                moment_note=moment_note,
            )
        else:
            register_moment(
                "event",
                event_id,
                "scheduled",
                value=f"{start_at} → {end_at}",
                moment_note=moment_note,
            )
        return get_full_event(event_id)
    return result


@router.delete("/{event_id}")
def delete_event(event_id: int):
    return supabase.table("events").delete().eq("id", event_id).execute().data
