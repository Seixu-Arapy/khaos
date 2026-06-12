from fastapi import APIRouter, HTTPException, Response, status

from app.database import supabase
from app.enums import PriorityEnum, StatusEnum
from app.schemas import TaskCreate, TaskSequenced, TaskUpdate
from app.services.moments import register_moment
from app.services.tasks import get_full_task, get_tasks
from app.services.time_entries import start_time_entry, stop_time_entry

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=list[TaskSequenced])
def list_tasks(
    section_id: int,
    status_enum: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
    due: str | None = None,
):
    """
    List action items under a section.
    """
    return get_tasks(
        section_id=section_id, status_enum=status_enum, priority=priority, due=due
    )


@router.get("/search", response_model=list[TaskSequenced])
def search_tasks(
    query: str,
    status_enum: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
):
    """
    Global search for task strings.
    """
    db_query = (
        supabase
        .table("tasks")
        .select(
            "*, sections(id, name, project_id, projects(id, name, field_id, fields(id, name)))"
        )
        .ilike("name", f"%{query}%")
    )
    if status_enum:
        db_query = db_query.eq("status", status_enum.value)
    if priority:
        db_query = db_query.eq("priority", priority.value)

    from app.services.sequences import inject_task_sequences

    return [inject_task_sequences(t) for t in db_query.execute().data]


@router.post("", response_model=TaskSequenced, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate):
    """
    Register a standalone executable task.
    """
    payload = task_data.model_dump(exclude={"moment_note"})
    payload["status"] = payload["status"].value
    if payload.get("priority"):
        payload["priority"] = payload["priority"].value

    result = supabase.table("tasks").insert(payload).execute().data
    if result:
        task_id = result[0]["id"]
        register_moment(
            "task",
            task_id,
            "created",
            value=task_data.status.value,
            moment_note=task_data.moment_note,
        )
        return get_full_task(task_id)
    raise HTTPException(status_code=400, detail="Failed to create task")


@router.patch("/{task_id}", response_model=TaskSequenced)
def update_task(task_id: int, task_data: TaskUpdate):
    """
    Update target parameters of an active task.
    """
    data = task_data.model_dump(exclude={"moment_note"}, exclude_none=True)
    if "priority" in data and data["priority"]:
        data["priority"] = data["priority"].value

    result = supabase.table("tasks").update(data).eq("id", task_id).execute().data
    if result:
        if task_data.due:
            register_moment(
                "task",
                task_id,
                "due",
                value=task_data.due,
                moment_note=task_data.moment_note,
            )
        if task_data.priority:
            register_moment(
                "task",
                task_id,
                "priority",
                value=task_data.priority.value,
                moment_note=task_data.moment_note,
            )
        if task_data.estimate is not None:
            register_moment(
                "task",
                task_id,
                "estimate",
                value=str(task_data.estimate),
                moment_note=task_data.moment_note,
            )
        return get_full_task(task_id)
    raise HTTPException(status_code=404, detail="Task not found")


@router.patch("/{task_id}/status", response_model=TaskSequenced)
def update_task_status(
    task_id: int,
    status_enum: StatusEnum,
    moment_note: str | None = None,
):
    """
    Advance task progression phases.
    """
    result = (
        supabase
        .table("tasks")
        .update({"status": status_enum.value})
        .eq("id", task_id)
        .execute()
        .data
    )
    if result:
        register_moment(
            "task",
            task_id,
            "status",
            value=status_enum.value,
            moment_note=moment_note,
        )
        return get_full_task(task_id)
    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int):
    """
    Delete a specific task database object.
    """
    supabase.table("tasks").delete().eq("id", task_id).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{task_id}/start")
def start_task_timer(task_id: int, moment_note: str | None = None):
    """
    Trigger a runtime tracker session.
    """
    return start_time_entry(task_id=task_id, moment_note=moment_note)


@router.patch("/{task_id}/stop")
def stop_task_timer(task_id: int, moment_note: str | None = None):
    """
    Halt an ongoing time tracking counter.
    """
    return stop_time_entry(task_id=task_id, moment_note=moment_note)
