from fastapi import APIRouter, HTTPException

from app.database import supabase
from app.models import PriorityEnum, StatusEnum
from app.moments import register_moment
from app.utils import enrich_task

router = APIRouter(prefix="/projects", tags=["Projects"])

PROJECT_SELECT = "*, fields(*)"


def get_full_project(project_id: int):
    return (
        supabase
        .table("projects")
        .select(PROJECT_SELECT)
        .eq("id", project_id)
        .single()
        .execute()
        .data
    )


@router.get("")
def list_projects(
    field_id: int | None = None,
    status: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
    due: str | None = None,
):
    query = supabase.table("projects").select(PROJECT_SELECT)
    if field_id:
        query = query.eq("field_id", field_id)
    if status:
        query = query.eq("status", status.value)
    if priority:
        query = query.eq("priority", priority.value)
    if due:
        query = query.eq("due", due)
    return query.execute().data


@router.get("/search")
def search_projects(query: str, status: StatusEnum | None = None):
    db_query = (
        supabase.table("projects").select(PROJECT_SELECT).ilike("name", f"%{query}%")
    )
    if status:
        db_query = db_query.eq("status", status.value)
    return db_query.execute().data


@router.get("/{project_id}")
def get_project(project_id: int, expand: bool = False):
    project = get_full_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    if expand:
        sections = (
            supabase
            .table("sections")
            .select("*")
            .eq("project_id", project_id)
            .execute()
            .data
        )
        for section in sections:
            tasks = (
                supabase
                .table("tasks")
                .select("*")
                .eq("section_id", section["id"])
                .execute()
                .data
            )
            section["tasks"] = [enrich_task(t) for t in tasks]
        project["sections"] = sections

    return project


@router.post("")
def create_project(
    name: str,
    field_id: int,
    status: StatusEnum = StatusEnum.planning,
    due: str | None = None,
    priority: PriorityEnum | None = None,
    doc_reference: str | None = None,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("projects")
        .insert({
            "name": name,
            "field_id": field_id,
            "status": status.value,
            "due": due,
            "priority": priority.value if priority else None,
            "doc_reference": doc_reference,
        })
        .execute()
        .data
    )
    if result:
        project_id = result[0]["id"]
        register_moment(
            "project", project_id, "created", value=name, moment_note=moment_note
        )
        if due:
            register_moment("project", project_id, "due", value=due)
        if priority:
            register_moment("project", project_id, "priority", value=priority.value)
        register_moment("project", project_id, "status", value=status.value)
        return get_full_project(project_id)
    return result


@router.patch("/{project_id}")
def update_project(
    project_id: int,
    name: str | None = None,
    due: str | None = None,
    field_id: int | None = None,
    priority: PriorityEnum | None = None,
    doc_reference: str | None = None,
    moment_note: str | None = None,
):
    data = {}
    if name:
        data["name"] = name
    if due:
        data["due"] = due
    if field_id:
        data["field_id"] = field_id
    if priority:
        data["priority"] = priority.value
    if doc_reference:
        data["doc_reference"] = doc_reference
    result = supabase.table("projects").update(data).eq("id", project_id).execute().data
    if result:
        if due:
            register_moment(
                "project", project_id, "due", value=due, moment_note=moment_note
            )
        if priority:
            register_moment(
                "project",
                project_id,
                "priority",
                value=priority.value,
                moment_note=moment_note,
            )
        return get_full_project(project_id)
    return result


@router.patch("/{project_id}/status")
def update_project_status(
    project_id: int,
    status: StatusEnum,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("projects")
        .update({"status": status.value})
        .eq("id", project_id)
        .execute()
        .data
    )
    if result:
        register_moment(
            "project", project_id, "status", value=status.value, moment_note=moment_note
        )
        return get_full_project(project_id)
    return result


@router.delete("/{project_id}")
def delete_project(project_id: int):
    return supabase.table("projects").delete().eq("id", project_id).execute().data
