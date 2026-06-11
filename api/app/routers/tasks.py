from datetime import UTC

from fastapi import APIRouter

from app.database import supabase
from app.models import PriorityEnum, StatusEnum
from app.moments import register_moment
from app.utils import enrich_task

router = APIRouter(prefix="/tasks", tags=["Tasks"])

TASK_SELECT = (
    "*, sections(id, name, project_id, projects(id, name, field_id, fields(id, name)))"
)


def get_full_task(task_id: int):
    result = (
        supabase
        .table("tasks")
        .select(TASK_SELECT)
        .eq("id", task_id)
        .single()
        .execute()
        .data
    )
    return enrich_task(result) if result else None


@router.get("")
def list_tasks(
    section_id: int,
    status: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
    due: str | None = None,
):
    query = supabase.table("tasks").select(TASK_SELECT).eq("section_id", section_id)
    if status:
        query = query.eq("status", status.value)
    if priority:
        query = query.eq("priority", priority.value)
    if due:
        query = query.eq("due", due)
    return [enrich_task(t) for t in query.execute().data]


@router.get("/search")
def search_tasks(
    query: str,
    status: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
):
    db_query = supabase.table("tasks").select(TASK_SELECT).ilike("name", f"%{query}%")
    if status:
        db_query = db_query.eq("status", status.value)
    if priority:
        db_query = db_query.eq("priority", priority.value)
    return [enrich_task(t) for t in db_query.execute().data]


@router.post("")
def create_task(
    name: str,
    section_id: int,
    status: StatusEnum = StatusEnum.todo,
    due: str | None = None,
    priority: PriorityEnum | None = None,
    estimate: int | None = None,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("tasks")
        .insert({
            "name": name,
            "section_id": section_id,
            "status": status.value,
            "due": due,
            "priority": priority.value if priority else None,
            "estimate": estimate,
        })
        .execute()
        .data
    )
    if result:
        task_id = result[0]["id"]
        register_moment("task", task_id, "created", value=name, moment_note=moment_note)
        if due:
            register_moment("task", task_id, "due", value=due)
        if estimate:
            register_moment("task", task_id, "estimate", value=str(estimate))
        if priority:
            register_moment("task", task_id, "priority", value=priority.value)
        register_moment("task", task_id, "status", value=status.value)
        return get_full_task(task_id)
    return result


@router.patch("/{task_id}")
def update_task(
    task_id: int,
    name: str | None = None,
    due: str | None = None,
    priority: PriorityEnum | None = None,
    estimate: int | None = None,
    moment_note: str | None = None,
):
    data = {}
    if name:
        data["name"] = name
    if due:
        data["due"] = due
    if priority:
        data["priority"] = priority.value
    if estimate:
        data["estimate"] = estimate
    result = supabase.table("tasks").update(data).eq("id", task_id).execute().data
    if result:
        if due:
            register_moment("task", task_id, "due", value=due, moment_note=moment_note)
        if estimate:
            register_moment(
                "task",
                task_id,
                "estimate",
                value=str(estimate),
                moment_note=moment_note,
            )
        if priority:
            register_moment(
                "task",
                task_id,
                "priority",
                value=priority.value,
                moment_note=moment_note,
            )
        return get_full_task(task_id)
    return result


@router.patch("/{task_id}/status")
def update_task_status(
    task_id: int,
    status: StatusEnum,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("tasks")
        .update({"status": status.value})
        .eq("id", task_id)
        .execute()
        .data
    )
    if result:
        register_moment(
            "task", task_id, "status", value=status.value, moment_note=moment_note
        )
        return get_full_task(task_id)
    return result


@router.delete("/{task_id}")
def delete_task(task_id: int):
    return supabase.table("tasks").delete().eq("id", task_id).execute().data


@router.post("/{task_id}/start")
def start_time_entry(task_id: int, moment_note: str | None = None):
    from datetime import datetime

    from fastapi import status as http_status

    any_active = (
        supabase
        .table("time_entries")
        .select("id")
        .is_("ended_at", "null")
        .execute()
        .data
    )
    if any_active:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
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


@router.patch("/{task_id}/stop")
def stop_time_entry(task_id: int, moment_note: str | None = None):
    from datetime import datetime

    from fastapi import HTTPException

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
