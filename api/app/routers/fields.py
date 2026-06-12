from fastapi import APIRouter, HTTPException, Response, status

from app.database import supabase
from app.schemas import FieldCreate, FieldModel, FieldUpdate

router = APIRouter(prefix="/fields", tags=["Fields"])


@router.get("", response_model=list[FieldModel])
def list_fields():
    """
    Retrieve all operational fields.
    """
    return supabase.table("fields").select("*").execute().data


@router.post("", response_model=FieldModel, status_code=status.HTTP_201_CREATED)
def create_field(field: FieldCreate):
    """
    Create a new operational field.
    """
    result = (
        supabase
        .table("fields")
        .insert(field.model_dump(exclude_none=True))
        .execute()
        .data
    )
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create field")
    return result[0]


@router.patch("/{field_id}", response_model=FieldModel)
def update_field(field_id: int, field_data: FieldUpdate):
    """
    Update an existing field's attributes.
    """
    data = field_data.model_dump(exclude_none=True)
    if not data:
        result = supabase.table("fields").select("*").eq("id", field_id).execute().data
    else:
        result = supabase.table("fields").update(data).eq("id", field_id).execute().data

    if not result:
        raise HTTPException(status_code=404, detail="Field not found")
    return result[0]


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(field_id: int):
    """
    Permanently delete an operational field.
    """
    supabase.table("fields").delete().eq("id", field_id).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
