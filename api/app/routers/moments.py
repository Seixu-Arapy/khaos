from fastapi import APIRouter, HTTPException, status

from app.database import supabase
from app.schemas import Moment, MomentCreate
from app.services.moments import register_moment

router = APIRouter(prefix="/moments", tags=["Moments"])


@router.post("", response_model=Moment, status_code=status.HTTP_201_CREATED)
def create_moment(moment_data: MomentCreate):
    """
    Explicitly insert a state machine transition audit track.
    """
    result = register_moment(
        entity_type=moment_data.entity_type,
        entity_id=moment_data.entity_id,
        event_type=moment_data.event_type,
        value=moment_data.value,
        moment_note=moment_data.moment_note,
    )

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to register history moment")

    return result.data[0]


@router.get("/{entity_type}/{entity_id}", response_model=list[Moment])
def get_moments(entity_type: str, entity_id: int):
    """
    Acquire structural logs tracking history of an object.
    """
    return (
        supabase
        .table("moments")
        .select("*")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .order("time")
        .execute()
        .data
    )
