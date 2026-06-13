from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.fields import FieldCreate, FieldUpdate
from app.services import fields as field_service

router = APIRouter(prefix="/fields", tags=["Fields"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_fields():
    """
    Fetch all enterprise area configuration operational fields mapped across system infrastructure.
    """
    return field_service.get_fields()


@router.get(
    "/{field_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def get_field_by_id(field_id: int):
    """
    Fetch attributes of an isolated enterprise structure definition area matching the explicit primary key identifier.
    """
    field = field_service.get_field(field_id)
    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Field not found"
        )
    return field


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_field(payload: FieldCreate):
    """
    Register and append a new master core semantic classification area domain to the operational infrastructure.
    """
    field = field_service.create_field(payload.model_dump())
    if not field:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create field"
        )
    return field


@router.patch(
    "/{field_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def update_field(field_id: int, payload: FieldUpdate):
    """
    Apply mutation updates over mutable enterprise taxonomy attributes using a partial parameters patch array.
    """
    updated_field = field_service.update_field(
        field_id, payload.model_dump(exclude_none=True)
    )
    if not updated_field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Field update failed"
        )
    return updated_field


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(field_id: int):
    """
    Purge a master framework classification domain area node sequence entry row from the central registry index.
    """
    if not field_service.delete_field(field_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Field deletion failed"
        )
