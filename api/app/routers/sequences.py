from fastapi import APIRouter

from app.database import supabase

router = APIRouter(tags=["Sequences"])


@router.post("/tasks-sequence")
def create_task_sequence(task_previous: int, task_next: int):
    return (
        supabase
        .table("tasks_sequence")
        .insert({"task_previous": task_previous, "task_next": task_next})
        .execute()
        .data
    )


@router.delete("/tasks-sequence")
def delete_task_sequence(task_previous: int, task_next: int):
    return (
        supabase
        .table("tasks_sequence")
        .delete()
        .eq("task_previous", task_previous)
        .eq("task_next", task_next)
        .execute()
        .data
    )


@router.post("/sections-sequence")
def create_section_sequence(section_previous: int, section_next: int):
    return (
        supabase
        .table("sections_sequence")
        .insert({"section_previous": section_previous, "section_next": section_next})
        .execute()
        .data
    )


@router.delete("/sections-sequence")
def delete_section_sequence(section_previous: int, section_next: int):
    return (
        supabase
        .table("sections_sequence")
        .delete()
        .eq("section_previous", section_previous)
        .eq("section_next", section_next)
        .execute()
        .data
    )
