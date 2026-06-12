from fastapi import APIRouter, HTTPException, Query

from app.database import supabase
from app.schemas import TimeEntryUpdate
from app.services.time_entries import get_full_time_entry, get_time_entries

router = APIRouter(prefix="/time-entries", tags=["Time Entries"])

TIME_ENTRY_SELECT_BASIC = "*"
TIME_ENTRY_SELECT_EXPANDED = "*, tasks(id, name, status, priority, sections(id, name, projects(id, name, fields(id, name))))"


@router.get("")
def list_time_entries(active: bool | None = Query(None), expand: bool = False):
    """
    Retrieve logged effort durations records.
    """
    return get_time_entries(active=active, expand=expand)


@router.get("/{entry_id}")
def get_time_entry(entry_id: int, expand: bool = False):
    """
    Locate an exact tracking log allocation entry.
    """
    result = get_full_time_entry(entry_id, expand)
    if not result:
        raise HTTPException(status_code=404, detail="Time entry not found")
    return result


@router.patch("/{entry_id}")
def update_time_entry(
    entry_id: int,
    entry_data: TimeEntryUpdate,
    expand: bool = False,
):
    """
    Overhaul parameters or rewrite manual metrics of tracking blocks.
    """
    data = entry_data.model_dump(exclude_none=True)
    if not data:
        return get_full_time_entry(entry_id, expand)

    result = (
        supabase.table("time_entries").update(data).eq("id", entry_id).execute().data
    )
    if result:
        return get_full_time_entry(entry_id, expand)
    raise HTTPException(status_code=404, detail="Time entry not found")
