from datetime import UTC, datetime

from fastapi import HTTPException

from app.database import supabase
from app.services.moments import register_moment

TIME_ENTRY_SELECT_BASIC = "*"
TIME_ENTRY_SELECT_EXPANDED = "*, tasks(id, name, status, priority, sections(id, name, projects(id, name, fields(id, name))))"


def get_full_time_entry(entry_id: int, expand: bool = False) -> dict:
    """
    Locates an exact time tracking session segment row by identity lookup index,
    optionally nesting complete task, section, and project lineage trees.
    """
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


def get_time_entries(
    active: bool | None = None, expand: bool = False
) -> list[dict] | dict | None:
    """
    Queries logged effort durations datasets or active running timers from database records.
    """
    select = TIME_ENTRY_SELECT_EXPANDED if expand else TIME_ENTRY_SELECT_BASIC
    query = supabase.table("time_entries").select(select)

    if active is True:
        result = query.is_("ended_at", None).execute().data
        return result[0] if result and len(result) > 0 else None

    return query.execute().data


def start_time_entry(task_id: int, moment_note: str | None = None) -> list[dict]:
    """
    Validates and triggers a new runtime tracker session database record for a task.
    """
    any_active = (
        supabase
        .table("time_entries")
        .select("*")
        .eq("task_id", task_id)
        .is_("ended_at", "null")
        .execute()
        .data
    )
    if any_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot start a new timer while another one is currently active. Stop the current timer first.",
        )

    now = datetime.now(UTC).isoformat()
    result = (
        supabase
        .table("time_entries")
        .insert({"task_id": task_id, "started_at": now})
        .execute()
        .data
    )
    if result:
        register_moment("task", task_id, "started", value=now, moment_note=moment_note)
    return result


def stop_time_entry(task_id: int, moment_note: str | None = None) -> list[dict]:
    """
    Halts an ongoing time tracking counter session row ledger.
    """
    active = (
        supabase
        .table("time_entries")
        .select("*")
        .eq("task_id", task_id)
        .is_("ended_at", "null")
        .execute()
        .data
    )
    if not active:
        raise HTTPException(
            status_code=404,
            detail=f"No active timer found for task {task_id}.",
        )

    now = datetime.now(UTC).isoformat()
    result = (
        supabase
        .table("time_entries")
        .update({"ended_at": now})
        .eq("id", active[0]["id"])
        .execute()
        .data
    )
    if result:
        register_moment("task", task_id, "stopped", value=now, moment_note=moment_note)
    return result
