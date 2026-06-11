from fastapi import APIRouter, HTTPException

from app.database import supabase

router = APIRouter(prefix="/time-entries", tags=["Time Entries"])

TIME_ENTRY_SELECT_BASIC = "*"
TIME_ENTRY_SELECT_EXPANDED = "*, tasks(id, name, status, priority, sections(id, name, projects(id, name, fields(id, name))))"


def get_full_time_entry(entry_id: int, expand: bool = False):
    select = TIME_ENTRY_SELECT_EXPANDED if expand else TIME_ENTRY_SELECT_BASIC
    return (
        supabase
        .table("time_entries")
        .select(select)
        .eq("id", entry_id)
        .single()
        .execute()
        .data
    )


@router.get("")
def list_time_entries(
    task_id: int | None = None,
    active: bool = False,
    expand: bool = False,
):
    select = TIME_ENTRY_SELECT_EXPANDED if expand else TIME_ENTRY_SELECT_BASIC
    query = supabase.table("time_entries").select(select)
    if task_id:
        query = query.eq("task_id", task_id)
    if active:
        query = query.is_("ended_at", "null")
    return query.order("started_at", desc=True).execute().data


@router.get("/active")
def get_active_time_entry(expand: bool = False):
    select = TIME_ENTRY_SELECT_EXPANDED if expand else TIME_ENTRY_SELECT_BASIC
    result = (
        supabase
        .table("time_entries")
        .select(select)
        .is_("ended_at", "null")
        .execute()
        .data
    )
    return result[0] if result else None


@router.get("/{entry_id}")
def get_time_entry(entry_id: int, expand: bool = False):
    result = get_full_time_entry(entry_id, expand)
    if not result:
        raise HTTPException(status_code=404, detail="Time entry não encontrada")
    return result


@router.patch("/{entry_id}")
def update_time_entry(
    entry_id: int,
    started_at: str | None = None,
    ended_at: str | None = None,
    task_id: int | None = None,
    expand: bool = False,
):
    data = {}
    if started_at:
        data["started_at"] = started_at
    if ended_at:
        data["ended_at"] = ended_at
    if task_id:
        data["task_id"] = task_id
    result = (
        supabase.table("time_entries").update(data).eq("id", entry_id).execute().data
    )
    if result:
        return get_full_time_entry(entry_id, expand)
    return result


@router.delete("/{entry_id}")
def delete_time_entry(entry_id: int):
    return supabase.table("time_entries").delete().eq("id", entry_id).execute().data
