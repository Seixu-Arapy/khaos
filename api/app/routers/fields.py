from fastapi import APIRouter

from app.database import supabase

router = APIRouter(prefix="/fields", tags=["Fields"])


@router.get("")
def list_fields():
    return supabase.table("fields").select("*").execute().data


@router.post("")
def create_field(name: str, doc_reference: str | None = None):
    return (
        supabase
        .table("fields")
        .insert({"name": name, "doc_reference": doc_reference})
        .execute()
        .data
    )


@router.patch("/{field_id}")
def update_field(
    field_id: int,
    name: str | None = None,
    doc_reference: str | None = None,
):
    data = {}
    if name:
        data["name"] = name
    if doc_reference:
        data["doc_reference"] = doc_reference
    return supabase.table("fields").update(data).eq("id", field_id).execute().data


@router.delete("/{field_id}")
def delete_field(field_id: int):
    return supabase.table("fields").delete().eq("id", field_id).execute().data
