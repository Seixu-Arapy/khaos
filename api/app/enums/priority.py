from enum import StrEnum


class PriorityEnum(StrEnum):
    """
    Defines the triage urgency level allocated to an action item.
    """

    urgent = "urgent"
    high = "high"
    medium = "medium"
    low = "low"
