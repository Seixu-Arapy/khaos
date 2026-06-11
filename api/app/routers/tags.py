from fastapi import APIRouter

from app.database import supabase

router = APIRouter(tags=["Tags"])


# ============================================================
# WORK TAGS
# ============================================================


@router.get("/work-tags")
def list_work_tags():
    return supabase.table("work_tags").select("*").execute().data


@router.post("/work-tags")
def create_work_tag(name: str, synonyms: list[str] | None = None):
    return (
        supabase
        .table("work_tags")
        .insert({"name": name, "synonyms": synonyms or []})
        .execute()
        .data
    )


@router.post("/work-tag-entities")
def add_work_tag_to_entity(work_tag_id: int, entity_type: str, entity_id: int):
    return (
        supabase
        .table("work_tag_entities")
        .insert({
            "work_tag_id": work_tag_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
        })
        .execute()
        .data
    )


@router.get("/work-tag-entities/{entity_type}/{entity_id}")
def get_entity_work_tags(entity_type: str, entity_id: int):
    return (
        supabase
        .table("work_tag_entities")
        .select("*, work_tags(*)")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .execute()
        .data
    )


# ============================================================
# MOMENT TAGS
# ============================================================


@router.get("/moment-tags")
def list_moment_tags():
    return supabase.table("moment_tags").select("*").execute().data


@router.post("/moment-tags")
def create_moment_tag(name: str, synonyms: list[str] | None = None):
    return (
        supabase
        .table("moment_tags")
        .insert({"name": name, "synonyms": synonyms or []})
        .execute()
        .data
    )


@router.post("/moment-tag-entities")
def add_moment_tag_to_entity(moment_tag_id: int, entity_type: str, entity_id: int):
    return (
        supabase
        .table("moment_tag_entities")
        .insert({
            "moment_tag_id": moment_tag_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
        })
        .execute()
        .data
    )


@router.get("/moment-tag-entities/{entity_type}/{entity_id}")
def get_entity_moment_tags(entity_type: str, entity_id: int):
    return (
        supabase
        .table("moment_tag_entities")
        .select("*, moment_tags(*)")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .execute()
        .data
    )
