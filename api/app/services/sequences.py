# app/services/sequences.py
from app.database import supabase


def inject_task_sequences(task: dict) -> dict:
    """
    Fetches and injects chronological predecessor and successor task dependencies
    directly into a raw task data dictionary.

    Args:
        task (dict): The raw task dictionary fetched from the database.

    Returns:
        dict: The mutated task dictionary containing 'previous_task' and 'next_task' nodes.
    """
    if not task or "id" not in task:
        return task

    previous_query = (
        supabase
        .table("tasks_sequence")
        .select("task_previous, tasks!task_previous(id, name)")
        .eq("task_next", task["id"])
        .execute()
        .data
    )

    next_query = (
        supabase
        .table("tasks_sequence")
        .select("task_next, tasks!task_next(id, name)")
        .eq("task_previous", task["id"])
        .execute()
        .data
    )

    task["task_previous"] = previous_query[0]["tasks"] if previous_query else None
    task["task_next"] = next_query[0]["tasks"] if next_query else None
    return task


def inject_sections_sequences(section: dict) -> dict:
    """
    Fetches and injects upstream and downstream sequence flow dependencies
    directly into a raw section data dictionary.

    Args:
        section (dict): The raw section dictionary fetched from the database.

    Returns:
        dict: The mutated section dictionary containing 'previous_section' and 'next_section' nodes.
    """
    if not section or "id" not in section:
        return section

    previous = (
        supabase
        .table("sections_sequence")
        .select("section_previous, sections!section_previous(id, name)")
        .eq("section_next", section["id"])
        .execute()
        .data
    )
    next_ = (
        supabase
        .table("sections_sequence")
        .select("section_next, sections!section_next(id, name)")
        .eq("section_previous", section["id"])
        .execute()
        .data
    )
    section["previous_section"] = previous[0]["sections"] if previous else None
    section["next_section"] = next_[0]["sections"] if next_ else None
    return section
