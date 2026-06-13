from typing import Any, cast

from fastapi import APIRouter, HTTPException, status

from app.database import supabase
from app.schemas.time_entries import TimeEntryCreate, TimeEntryUpdate

router = APIRouter(prefix="/time-entries", tags=["Time Entries"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_time_entries(
    active: bool | None = None,
    expand: bool = False,
):
    """
    Retrieve tracked work duration records with optional status filtering and task expansion.
    """
    query = supabase.table("time_entries")

    query = query.select("*, tasks(*)") if expand else query.select("*")

    if active is True:
        query = query.is_("ended_at", "null")
    elif active is False:
        query = query.not_.is_("ended_at", "null")

    result = query.execute().data
    if isinstance(result, list):
        return [item for item in result if isinstance(item, dict)]
    return []


@router.get(
    "/{entry_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def get_time_entry_by_id(entry_id: int, expand: bool = False):
    """
    Fetch a single precise work duration recording session by its primary tracking key.
    """
    query = supabase.table("time_entries")

    query = query.select("*, tasks(*)") if expand else query.select("*")

    result = query.eq("id", entry_id).execute().data
    if isinstance(result, list) and result:
        return cast(dict[str, Any], result[0])

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Time entry not found"
    )


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_time_entry(payload: TimeEntryCreate):
    """
    Commit a new tracked duration row log item to the persistent time tracking registry database.
    """
    data = payload.model_dump(exclude={"moment_note"})
    result = supabase.table("time_entries").insert(data).select().execute().data

    if isinstance(result, list) and result:
        return cast(dict[str, Any], result[0])

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create time entry"
    )


@router.patch(
    "/{entry_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def update_time_entry(entry_id: int, payload: TimeEntryUpdate):
    """
    Apply retroactive modifications or context parameter updates over an explicit duration session log.
    """
    data = payload.model_dump(exclude_none=True)
    result = (
        supabase
        .table("time_entries")
        .update(data)
        .eq("id", entry_id)
        .select()
        .execute()
        .data
    )

    if isinstance(result, list) and result:
        return cast(dict[str, Any], result[0])

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Time entry update failed"
    )


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_time_entry(entry_id: int):
    """
    Purge an explicit logged duration segment entry session from the system data registry index.
    """
    result = supabase.table("time_entries").delete().eq("id", entry_id).execute().data

    if not (isinstance(result, list) and result):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Time entry deletion failed"
        )
