from typing import NamedTuple

from pydantic import BaseModel, Field

from app.enums import PriorityEnum, StatusEnum

from .sections import SectionExpanded


class TaskBase(BaseModel):
    name: str = Field(
        description="The textual summary of the objective to be accomplished"
    )
    section_id: int = Field(
        description="The section ID defining where this action item belongs"
    )
    due: str | None = Field(
        None, description="Task specific due date target formatted as YYYY-MM-DD"
    )
    priority: PriorityEnum | None = Field(
        None, description="Relative priority class assigned to this specific task"
    )
    estimate: int | None = Field(
        None, description="The projected time or effort estimate measured in minutes"
    )


class Task(TaskBase):
    """
    Core primitive mapping an active standalone executable action unit.
    """

    id: int = Field(
        description="The automated structural primary key row identifier database sequence"
    )
    status: StatusEnum = Field(
        description="The exact progression step or workflow status state of the task item"
    )


class TaskExpanded(Task):
    """
    Represents the full vertical lineage hierarchy from the task up to its section and project.
    """

    sections: SectionExpanded | None = Field(
        None,
        description="The full nested parent section and layout ancestor metadata chain",
    )


class TaskSequence(NamedTuple):
    """
    Defines a directed dependency link between two individual task units.

    This structural model enforces execution order within workflows, mapping
    a predecessor requirement to its downstream consumer target.
    """

    TaskPrevious: int = Field(
        ...,
        description="The dependency predecessor task unit key ID. This task must be completed before the next can begin.",
    )
    TaskNext: int = Field(
        ...,
        description="The downstream block dependent consumer successor task target ID. Locked until the predecessor task finishes.",
    )


class TaskSequenced(TaskExpanded):
    """
    Extends the hierarchically expanded task model to include neutral horizontal sequence links matching the database structure exactly.
    """

    TaskPrevious: Task | None = Field(
        None,
        description="The structural task node positioned immediately before this element in the sequence timeline",
    )
    TaskNext: Task | None = Field(
        None,
        description="The structural task node positioned immediately after this element in the sequence timeline",
    )


class TaskCreate(TaskBase):
    """
    Contract required to initialize an item token inside a board column target.
    """

    status: StatusEnum = Field(
        StatusEnum.todo,
        description="The baseline workflow entry status designation applied on creation",
    )
    moment_note: str | None = Field(
        None,
        description="Context tracking summary logged to audit history moments upon setup",
    )


class TaskUpdate(BaseModel):
    """
    Payload parameters utilized to modify execution states across tasks attributes.
    """

    name: str | None = Field(
        None,
        description="The alternative text label description for the work unit summary",
    )
    due: str | None = Field(
        None,
        description="Rescheduled boundary target execution date structured as YYYY-MM-DD",
    )
    priority: PriorityEnum | None = Field(
        None, description="Modified urgency prioritization assignment designation tier"
    )
    estimate: int | None = Field(
        None,
        description="Adjusted operational task time effort allocation parameter values",
    )
    moment_note: str | None = Field(
        None,
        description="Audit evaluation log annotation tracking patches updates context values",
    )
