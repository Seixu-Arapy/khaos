from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.moments import MomentCreate
from app.services import moments as moment_service

router = APIRouter(prefix="/moments", tags=["Moments"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_moments():
    """
    Fetch transactional footprint historical ledger entries capturing atomic state machine transition matrices mutations.
    """
    return moment_service.get_moments()


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_moment(payload: MomentCreate):
    """
    Explicitly record and append a new structured lifecycle audit trail footprint into the tracking engine database ledger.
    """
    moment = moment_service.create_moment(payload.model_dump())
    if not moment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create moment log",
        )
    return moment
