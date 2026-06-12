from fastapi import APIRouter, HTTPException, Response, status

from app.database import supabase
from app.schemas import SectionSequence, TaskSequence

router = APIRouter(tags=["Sequences"])


@router.post("/tasks-sequence", status_code=status.HTTP_201_CREATED)
def create_task_sequence(sequence: TaskSequence):
    """
    Establish a neutral chronological sequence link between two tasks.
    """
    return supabase.table("tasks_sequence").insert(sequence.model_dump()).execute().data


@router.patch("/tasks-sequence", status_code=status.HTTP_200_OK)
def update_task_sequence(old_sequence: TaskSequence, new_sequence: TaskSequence):
    """
    Modify an existing timeline sequence layout, mapping alternative tracking nodes.
    """
    result = (
        supabase
        .table("tasks_sequence")
        .update(new_sequence.model_dump())
        .eq("task_previous", old_sequence.task_previous)
        .eq("task_next", old_sequence.task_next)
        .execute()
        .data
    )
    if not result:
        raise HTTPException(
            status_code=404, detail="Target sequence map link not found"
        )
    return result


@router.delete("/tasks-sequence", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_sequence(sequence: TaskSequence):
    """
    Break a sequence timeline pairing link between two tasks.
    """
    supabase.table("tasks_sequence").delete().eq(
        "task_previous", sequence.task_previous
    ).eq("task_next", sequence.task_next).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/sections-sequence", status_code=status.HTTP_201_CREATED)
def create_section_sequence(sequence: SectionSequence):
    """
    Map downstream milestone tracks across board section layout elements.
    """
    return (
        supabase.table("sections_sequence").insert(sequence.model_dump()).execute().data
    )


@router.patch("/sections-sequence", status_code=status.HTTP_200_OK)
def update_section_sequence(
    old_sequence: SectionSequence, new_sequence: SectionSequence
):
    """
    Modify an existing timeline sequence layout, mapping alternative tracking nodes.
    """
    result = (
        supabase
        .table("sections_sequence")
        .update(new_sequence.model_dump())
        .eq("section_previous", old_sequence.section_previous)
        .eq("section_next", old_sequence.section_next)
        .execute()
        .data
    )
    if not result:
        raise HTTPException(
            status_code=404, detail="Target sequence map link not found"
        )
    return result


@router.delete("/sections-sequence", status_code=status.HTTP_204_NO_CONTENT)
def delete_section_sequence(sequence: SectionSequence):
    """
    Deconstruct timeline continuation elements mapping across structural sections.
    """
    supabase.table("sections_sequence").delete().eq(
        "section_previous", sequence.section_previous
    ).eq("section_next", sequence.section_next).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
