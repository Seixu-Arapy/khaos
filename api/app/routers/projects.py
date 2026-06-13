from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.projects import ProjectCreate, ProjectUpdate
from app.services import projects as project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
def list_projects():
    """
    Fetch all active project workspace container records stored in the database.
    """
    return project_service.get_projects()


@router.get(
    "/{project_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def get_project_by_id(project_id: int):
    """
    Fetch full vertical lineage details for a single project workspace container matching the unique ID.
    """
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return project


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate):
    """
    Instantiate a new project workspace container inside the database repository.
    """
    project = project_service.create_project(
        payload.model_dump(exclude={"moment_note"})
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create project"
        )
    return project


@router.patch(
    "/{project_id}", response_model=dict[str, Any], status_code=status.HTTP_200_OK
)
def update_project(project_id: int, payload: ProjectUpdate):
    """
    Apply selective property mutations over mutable project metadata variables using a patch blueprint.
    """
    updated_project = project_service.update_project(
        project_id, payload.model_dump(exclude={"moment_note"}, exclude_none=True)
    )
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project update failed"
        )
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int):
    """
    Remove a project workspace record container from the persistent engine by its unique sequential identifier.
    """
    if not project_service.delete_project(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project deletion failed"
        )
