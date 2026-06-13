from typing import Any, cast

from fastapi import APIRouter, HTTPException, status

from app.services.sequences import (
    create_task_sequence,
    delete_section_sequence,
    get_tasks_sequences,
    upsert_section_sequence,
    upsert_task_sequence,
)

router = APIRouter(prefix="/sequences", tags=["Sequences"])


@router.get(
    "/tasks", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK
)
def list_tasks_sequences():
    """
    Fetch structural continuity matrices binding sequential predecessor and successor execution items.
    """
    return get_tasks_sequences()


@router.post(
    "/tasks", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED
)
def bind_task_sequence(payload: dict[str, Any]):
    """
    Commit an immutable explicit execution priority ordering constraint link between two tasks.
    """
    if "task_previous" not in payload or "task_next" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required task bounds keys",
        )
    return cast(dict[str, Any], create_task_sequence(payload))


@router.put("/tasks", response_model=dict[str, Any], status_code=status.HTTP_200_OK)
def overwrite_task_sequence(payload: dict[str, Any]):
    """
    Force update or append structural relational execution sequencing paths parameters across active items.
    """
    return cast(dict[str, Any], upsert_task_sequence(payload))


@router.put("/sections", response_model=dict[str, Any], status_code=status.HTTP_200_OK)
def overwrite_section_sequence(payload: dict[str, Any]):
    """
    Configure or reshape relational layout continuity mappings separating active milestone tracking columns.
    """
    if "section_previous" not in payload or "section_next" not in payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required section bounds keys",
        )
    return cast(dict[str, Any], upsert_section_sequence(payload))


@router.delete(
    "/sections/{section_previous}/{section_next}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def break_section_sequence(section_previous: int, section_next: int):
    """
    Delete structural tracking constraints separating adjacent layout board section columns elements.
    """
    if not delete_section_sequence(section_previous, section_next):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target sequencing connection link path missing",
        )
