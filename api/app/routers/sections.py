from fastapi import APIRouter, HTTPException, Response, status

from app.database import supabase
from app.enums import PriorityEnum, StatusEnum
from app.schemas import SectionCreate, SectionExpanded, SectionUpdate
from app.services.moments import register_moment
from app.services.sections import get_full_section, get_sections

router = APIRouter(prefix="/sections", tags=["Sections"])


@router.get("", response_model=list[SectionExpanded])
def list_sections(
    project_id: int,
    status_enum: StatusEnum | None = None,
    priority: PriorityEnum | None = None,
):
    """
    Fetch sections attached to a project.
    """
    return get_sections(
        project_id=project_id,
        status_str=status_enum.value if status_enum else None,
        priority_str=priority.value if priority else None,
    )


@router.get("/search", response_model=list[SectionExpanded])
def search_sections(query: str, status_enum: StatusEnum | None = None):
    """
    Fuzzy search structural sections.
    """
    from app.services.sections import SECTION_SELECT

    db_query = (
        supabase.table("sections").select(SECTION_SELECT).ilike("name", f"%{query}%")
    )
    if status_enum:
        db_query = db_query.eq("status", status_enum.value)
    return db_query.execute().data


@router.post("", response_model=SectionExpanded, status_code=status.HTTP_201_CREATED)
def create_section(section_data: SectionCreate):
    """
    Create a section block within a project.
    """
    payload = section_data.model_dump(exclude={"moment_note"})
    payload["status"] = payload["status"].value
    if payload.get("priority"):
        payload["priority"] = payload["priority"].value

    result = supabase.table("sections").insert(payload).execute().data
    if result:
        section_id = result[0]["id"]
        register_moment(
            "section",
            section_id,
            "created",
            value=section_data.status.value,
            moment_note=section_data.moment_note,
        )
        return get_full_section(section_id)
    raise HTTPException(status_code=400, detail="Failed to create section")


@router.patch("/{section_id}", response_model=SectionExpanded)
def update_section(section_id: int, section_data: SectionUpdate):
    """
    Update section metadata.
    """
    data = section_data.model_dump(exclude={"moment_note"}, exclude_none=True)
    if "priority" in data and data["priority"]:
        data["priority"] = data["priority"].value

    result = supabase.table("sections").update(data).eq("id", section_id).execute().data
    if result:
        if section_data.due:
            register_moment(
                "section",
                section_id,
                "due",
                value=section_data.due,
                moment_note=section_data.moment_note,
            )
        if section_data.priority:
            register_moment(
                "section",
                section_id,
                "priority",
                value=section_data.priority.value,
                moment_note=section_data.moment_note,
            )
        return get_full_section(section_id)
    raise HTTPException(status_code=404, detail="Section not found")


@router.patch("/{section_id}/status", response_model=SectionExpanded)
def update_section_status(
    section_id: int,
    status_enum: StatusEnum,
    moment_note: str | None = None,
):
    """
    Transition a single section state flow.
    """
    result = (
        supabase
        .table("sections")
        .update({"status": status_enum.value})
        .eq("id", section_id)
        .execute()
        .data
    )
    if result:
        register_moment(
            "section",
            section_id,
            "status",
            value=status_enum.value,
            moment_note=moment_note,
        )
        return get_full_section(section_id)
    raise HTTPException(status_code=404, detail="Section not found")


@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int):
    """
    Remove a section layout unit.
    """
    supabase.table("sections").delete().eq("id", section_id).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
