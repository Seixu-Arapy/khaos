from fastapi import APIRouter, status

from app.database import supabase
from app.schemas import MomentTagEntity, Tag, TagCreate, WorkTagEntity

router = APIRouter(tags=["Tags"])


@router.get("/work-tags", response_model=list[Tag])
def list_work_tags():
    """
    Retrieve available taxonomies for work items.
    """
    return supabase.table("work_tags").select("*").execute().data


@router.post(
    "/work-tags", response_model=list[Tag], status_code=status.HTTP_201_CREATED
)
def create_work_tag(tag: TagCreate):
    """
    Register a core workflow categorical tag indicator.
    """
    return supabase.table("work_tags").insert(tag.model_dump()).execute().data


@router.post("/work-tag-entities", status_code=status.HTTP_201_CREATED)
def add_work_tag_to_entity(binding: WorkTagEntity):
    """
    Attach an execution tag definition onto a workspace resource row.
    """
    return (
        supabase.table("work_tag_entities").insert(binding.model_dump()).execute().data
    )


@router.get("/work-tag-entities/{entity_type}/{entity_id}")
def get_entity_work_tags(entity_type: str, entity_id: int):
    """
    Fetch categorical taxonomy references attached to an entity.
    """
    return (
        supabase
        .table("work_tag_entities")
        .select("*, work_tags(*)")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .execute()
        .data
    )


@router.get("/moment-tags", response_model=list[Tag])
def list_moment_tags():
    """
    Retrieve standard labels index dedicated for lifecycle log audit profiling.
    """
    return supabase.table("moment_tags").select("*").execute().data


@router.post(
    "/moment-tags", response_model=list[Tag], status_code=status.HTTP_201_CREATED
)
def create_moment_tag(tag: TagCreate):
    """
    Register specialized taxonomy markers dedicated to change history logs.
    """
    return supabase.table("moment_tags").insert(tag.model_dump()).execute().data


@router.post("/moment-tag-entities", status_code=status.HTTP_201_CREATED)
def add_moment_tag_to_entity(binding: MomentTagEntity):
    """
    Map an analytical historical profile tracker label onto an audit moment step row.
    """
    return (
        supabase
        .table("moment_tag_entities")
        .insert(binding.model_dump())
        .execute()
        .data
    )


@router.get("/moment-tag-entities/{entity_type}/{entity_id}")
def get_entity_moment_tags(entity_type: str, entity_id: int):
    """
    Resolve historical analysis classifications indicators linked to target entity logs.
    """
    return (
        supabase
        .table("moment_tag_entities")
        .select("*, moment_tags(*)")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .execute()
        .data
    )
