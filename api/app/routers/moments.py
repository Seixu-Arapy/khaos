from fastapi import APIRouter

from app.database import supabase
from app.moments import register_moment

router = APIRouter(prefix="/moments", tags=["Moments"])


@router.post("")
def create_moment(
    entity_type: str,
    entity_id: int,
    event_type: str,
    value: str | None = None,
    moment_note: str | None = None,
):
    return register_moment(entity_type, entity_id, event_type, value, moment_note).data


@router.get("/{entity_type}/{entity_id}")
def get_moments(entity_type: str, entity_id: int):
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
