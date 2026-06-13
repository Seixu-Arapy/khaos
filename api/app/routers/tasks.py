from typing import Any, cast

from fastapi import APIRouter, HTTPException, status

from app.database import supabase
from app.schemas.tasks import (
    TaskCreate,
    TaskPriorityUpdate,
    TaskStatusUpdate,
    TaskUpdate,
)
from app.services.tasks import (
    create_task,
    delete_task,
    get_task,
    get_tasks,
    update_task,
    update_task_status,
    uppdate_task_priority,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_tasks():
    """
    Retrieve all tasks stored across the system.
    """
    return get_tasks()


@router.get("/{task_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK)
def get_task_by_id(task_id: int):
    """
    Retrieve attributes for a single active execution task unit matching the ID.
    """
    task = get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )
    return task


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_task_endpoint(payload: TaskCreate):
    """
    Commit a new active execution token entry row and log its initial moment.
    """
    from app.services.moments import create_moment

    data = payload.model_dump(exclude={"moment_note"})
    result = create_task(data)

    if result and isinstance(result, dict):
        task_id = result["id"]
        moment_payload = {
            "entity_type": "task",
            "entity_id": task_id,
            "event_type": "created",
            "value": payload.status,
            "moment_note": payload.moment_note,
        }
        create_moment(moment_payload)
        return result

    raise HTTPException(status_code=400, detail="Failed to create task")


@router.patch(
    "/{task_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def update_task_endpoint(task_id: int, payload: TaskUpdate):
    """
    Apply selective parameter updates over a targeted task and track state change.
    """
    from app.services.moments import create_moment

    task_before = get_task(task_id)
    if not task_before:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude={"moment_note"}, exclude_none=True)
    result = update_task(task_id, data)

    if result and isinstance(result, dict):
        if "status" in data and data["status"] != task_before.get("status"):
            moment_payload = {
                "entity_type": "task",
                "entity_id": task_id,
                "event_type": "status_changed",
                "value": f"{task_before.get('status')} → {data['status']}",
                "moment_note": payload.moment_note,
            }
            create_moment(moment_payload)
        elif payload.moment_note:
            moment_payload = {
                "entity_type": "task",
                "entity_id": task_id,
                "event_type": "updated",
                "value": None,
                "moment_note": payload.moment_note,
            }
            create_moment(moment_payload)
        return result

    raise HTTPException(status_code=400, detail="Task update failed")


@router.patch("/{task_id}/status", status_code=status.HTTP_200_OK)
def update_task_status_endpoint(task_id: int, payload: TaskStatusUpdate):
    """
    Update a task's status.
    """
    if task_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The task identifier must be a positive integer.",
        )

    result = update_task_status(task_id=task_id, new_status=payload.status)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )

    return result


@router.patch("/{task_id}/priority", status_code=status.HTTP_200_OK)
def update_task_priority_endpoint(task_id: int, payload: TaskPriorityUpdate):
    """
    Update a task's priority.
    """
    if task_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The task identifier must be a positive integer.",
        )

    result = uppdate_task_priority(task_id=task_id, new_priority=payload.priority)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )

    return result


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: int):
    """
    Delete a task row reference from the core workflow pipeline matrix.
    """
    if not delete_task(task_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found or could not be deleted.",
        )


@router.post(
    "/{task_id}/start", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def start_task(task_id: int):
    """
    Initialize a structural workflow time log registration chunk for tracking operational effort.
    """
    from datetime import datetime

    from app.services.time_entries import create_time_entry

    now_iso = datetime.utcnow().isoformat() + "Z"
    task_check = get_task(task_id)
    if not task_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    active_entry = (
        supabase
        .table("time_entries")
        .select("*")
        .eq("task_id", task_id)
        .is_("ended_at", "null")
        .execute()
        .data
    )
    if isinstance(active_entry, list) and active_entry:
        return cast(dict[str, Any], active_entry[0])

    entry_payload = {"task_id": task_id, "started_at": now_iso, "ended_at": None}
    return cast(dict[str, Any], create_time_entry(entry_payload))


@router.post(
    "/{task_id}/stop", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def stop_task(task_id: int):
    """
    Close active work timing logging slots matching the targeted functional token link.
    """
    from datetime import datetime

    now_iso = datetime.utcnow().isoformat() + "Z"
    active_entries = (
        supabase
        .table("time_entries")
        .select("*")
        .eq("task_id", task_id)
        .is_("ended_at", "null")
        .execute()
        .data
    )
    if not (isinstance(active_entries, list) and active_entries):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active running timer entries found for task",
        )

    first_entry = cast(dict[str, Any], active_entries[0])
    entry_id = first_entry["id"]
    result = (
        supabase
        .table("time_entries")
        .update({"ended_at": now_iso})
        .eq("id", entry_id)
        .select()
        .execute()
        .data
    )
    if isinstance(result, list) and result:
        return cast(dict[str, Any], result[0])
    return {}
