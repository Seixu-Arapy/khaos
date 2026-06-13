from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.tags import TagCreate
from app.services import tags as tag_service

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_tags():
    """
    Fetch a comprehensive collection of global searchable taxonomy classification labels and synonym metrics.
    """
    return tag_service.get_tags()


@router.get("/{tag_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK)
def get_tag_by_id(tag_id: int):
    """
    Retrieve descriptive lookup aliases arrays variables configured beneath a targeted reference tracking key.
    """
    tag = tag_service.get_tag(tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )
    return tag


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_tag(payload: TagCreate):
    """
    Inject a new validated classification look-up record directly into the centralized platform index database.
    """
    tag = tag_service.create_tag(payload.model_dump())
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create tag"
        )
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int):
    """
    Delete an entry element profile lookup categorization item label handle from the platform directory.
    """
    if not tag_service.delete_tag(tag_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag deletion failed"
        )
