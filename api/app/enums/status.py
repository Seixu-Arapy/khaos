from enum import StrEnum


class StatusEnum(StrEnum):
    """
    Represents the operational execution phase of a workspace entity.
    """

    planning = "planning"
    todo = "todo"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"
    paused = "paused"
    cancelled = "cancelled"
