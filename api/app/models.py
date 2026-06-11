from enum import StrEnum
from typing import Literal

from pydantic import BaseModel


class StatusEnum(StrEnum):
    planning = "planning"
    todo = "todo"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"
    paused = "paused"
    cancelled = "cancelled"


class PriorityEnum(StrEnum):
    urgent = "urgent"
    high = "high"
    medium = "medium"
    low = "low"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: Literal["claude", "gemini", "deepseek"] = "gemini"
    messages: list[ChatMessage]
