from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.sections import SectionCreate, SectionUpdate
from app.services import sections as section_service

router = APIRouter(prefix="/sections", tags=["Sections"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_sections():
    """
    Fetch all horizontal layout stage columns, layout lineage properties, and relative milestone sequences.
    """
    return section_service.get_sections()


@router.get(
    "/{section_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def get_section_by_id(section_id: int):
    """
    Fetch layout definition metadata parameters linked to a single horizontal milestone column container.
    """
    section = section_service.get_full_section(section_id)
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Section not found"
        )
    return section


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_section(payload: SectionCreate):
    """
    Insert a new horizontal structural column milestone step container module inside a target workspace project.
    """
    section = section_service.create_section(
        payload.model_dump(exclude={"moment_note"})
    )
    if not section:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create section"
        )
    return section


@router.patch(
    "/{section_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def update_section(section_id: int, payload: SectionUpdate):
    """
    Reshape execution priorities tiers, assign execution deadlines, or rewrite documentation links records.
    """
    updated_section = section_service.update_section(
        section_id, payload.model_dump(exclude={"moment_note"}, exclude_none=True)
    )
    if not updated_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Section update failed"
        )
    return updated_section


@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int):
    """
    Remove an active milestone section row block container definition from sequence matrix registers.
    """
    if not section_service.delete_section(section_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Section deletion failed"
        )
