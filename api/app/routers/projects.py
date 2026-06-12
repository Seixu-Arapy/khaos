from fastapi import APIRouter, HTTPException, Response, status

from app.database import supabase
from app.enums import PriorityEnum, StatusEnum
from app.schemas import ProjectCreate, ProjectExpanded, ProjectUpdate
from app.services.moments import register_moment
from app.services.projects import get_full_project, get_projects

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectExpanded])
def list_projects(
    field_id: int | None = None,
    status: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
    due: str | None = None,
):
    """
    List and filter projects with nested fields.
    """
    return get_projects(field_id=field_id, status=status, priority=priority, due=due)


@router.get("/search", response_model=list[ProjectExpanded])
def search_projects(query: str, status: StatusEnum | None = None):
    """
    Search projects by name.
    """
    db_query = (
        supabase.table("projects").select("*, fields(*)").ilike("name", f"%{query}%")
    )
    if status:
        db_query = db_query.eq("status", status.value)
    return db_query.execute().data


@router.post("", response_model=ProjectExpanded, status_code=status.HTTP_201_CREATED)
def create_project(project_data: ProjectCreate):
    """
    Create a new project workspace.
    """
    payload = project_data.model_dump(exclude={"moment_note"})
    payload["status"] = payload["status"].value
    if payload.get("priority"):
        payload["priority"] = payload["priority"].value

    result = supabase.table("projects").insert(payload).execute().data
    if result:
        project_id = result[0]["id"]
        register_moment(
            "project",
            project_id,
            "created",
            value=project_data.status.value,
            moment_note=project_data.moment_note,
        )
        return get_full_project(project_id)
    raise HTTPException(status_code=400, detail="Failed to create project")


@router.patch("/{project_id}", response_model=ProjectExpanded)
def update_project(project_id: int, project_data: ProjectUpdate):
    """
    Modify core project details.
    """
    data = project_data.model_dump(exclude={"moment_note"}, exclude_none=True)
    if "priority" in data and data["priority"]:
        data["priority"] = data["priority"].value

    result = supabase.table("projects").update(data).eq("id", project_id).execute().data
    if result:
        if project_data.due:
            register_moment(
                "project",
                project_id,
                "due",
                value=project_data.due,
                moment_note=project_data.moment_note,
            )
        if project_data.priority:
            register_moment(
                "project",
                project_id,
                "priority",
                value=project_data.priority.value,
                moment_note=project_data.moment_note,
            )
        return get_full_project(project_id)
    raise HTTPException(status_code=404, detail="Project not found or no changes made")


@router.patch("/{project_id}/status", response_model=ProjectExpanded)
def update_project_status(
    project_id: int,
    status_enum: StatusEnum,
    moment_note: str | None = None,
):
    """
    Transition a project's life cycle status.
    """
    result = (
        supabase
        .table("projects")
        .update({"status": status_enum.value})
        .eq("id", project_id)
        .execute()
        .data
    )
    if result:
        register_moment(
            "project",
            project_id,
            "status",
            value=status_enum.value,
            moment_note=moment_note,
        )
        return get_full_project(project_id)
    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int):
    """
    Permanently delete a project record.
    """
    supabase.table("projects").delete().eq("id", project_id).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
