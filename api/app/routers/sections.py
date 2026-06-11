from fastapi import APIRouter

from app.database import supabase
from app.models import PriorityEnum, StatusEnum
from app.moments import register_moment

router = APIRouter(prefix="/sections", tags=["Sections"])

SECTION_SELECT = "*, projects(id, name, field_id, fields(id, name))"


def get_full_section(section_id: int):
    return (
        supabase
        .table("sections")
        .select(SECTION_SELECT)
        .eq("id", section_id)
        .single()
        .execute()
        .data
    )


@router.get("")
def list_sections(
    project_id: int,
    status: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
):
    query = (
        supabase.table("sections").select(SECTION_SELECT).eq("project_id", project_id)
    )
    if status:
        query = query.eq("status", status.value)
    if priority:
        query = query.eq("priority", priority.value)
    return query.execute().data


@router.get("/search")
def search_sections(query: str, status: StatusEnum | None = None):
    db_query = (
        supabase.table("sections").select(SECTION_SELECT).ilike("name", f"%{query}%")
    )
    if status:
        db_query = db_query.eq("status", status.value)
    return db_query.execute().data


@router.post("")
def create_section(
    name: str,
    project_id: int,
    status: StatusEnum = StatusEnum.planning,
    due: str | None = None,
    priority: PriorityEnum | None = None,
    doc_reference: str | None = None,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("sections")
        .insert({
            "name": name,
            "project_id": project_id,
            "status": status.value,
            "due": due,
            "priority": priority.value if priority else None,
            "doc_reference": doc_reference,
        })
        .execute()
        .data
    )
    if result:
        section_id = result[0]["id"]
        register_moment(
            "section", section_id, "created", value=name, moment_note=moment_note
        )
        if due:
            register_moment("section", section_id, "due", value=due)
        if priority:
            register_moment("section", section_id, "priority", value=priority.value)
        register_moment("section", section_id, "status", value=status.value)
        return get_full_section(section_id)
    return result


@router.patch("/{section_id}")
def update_section(
    section_id: int,
    name: str | None = None,
    due: str | None = None,
    priority: PriorityEnum | None = None,
    doc_reference: str | None = None,
    moment_note: str | None = None,
):
    data = {}
    if name:
        data["name"] = name
    if due:
        data["due"] = due
    if priority:
        data["priority"] = priority.value
    if doc_reference:
        data["doc_reference"] = doc_reference
    result = supabase.table("sections").update(data).eq("id", section_id).execute().data
    if result:
        if due:
            register_moment(
                "section", section_id, "due", value=due, moment_note=moment_note
            )
        if priority:
            register_moment(
                "section",
                section_id,
                "priority",
                value=priority.value,
                moment_note=moment_note,
            )
        return get_full_section(section_id)
    return result


@router.patch("/{section_id}/status")
def update_section_status(
    section_id: int,
    status: StatusEnum,
    moment_note: str | None = None,
):
    result = (
        supabase
        .table("sections")
        .update({"status": status.value})
        .eq("id", section_id)
        .execute()
        .data
    )
    if result:
        register_moment(
            "section", section_id, "status", value=status.value, moment_note=moment_note
        )
        return get_full_section(section_id)
    return result


@router.delete("/{section_id}")
def delete_section(section_id: int):
    return supabase.table("sections").delete().eq("id", section_id).execute().data
