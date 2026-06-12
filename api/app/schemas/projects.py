from pydantic import BaseModel, Field

from app.enums import PriorityEnum, StatusEnum

from .fields import FieldModel


class ProjectBase(BaseModel):
    name: str = Field(description="The title/name of the project workspace")
    field_id: int = Field(
        description="The operational domain area unique reference identifier"
    )
    due: str | None = Field(
        None, description="Project target deadline tracked in YYYY-MM-DD format"
    )
    priority: PriorityEnum | None = Field(
        None, description="The allocated triage urgency level assigned to the project"
    )
    doc_reference: str | None = Field(
        None,
        description="External reference link or path targeting central project documentation",
    )


class Project(ProjectBase):
    """
    Core representation of a project record container with persistent system attributes.
    """

    id: int = Field(
        description="The unique automated record identifier database primary key"
    )
    status: StatusEnum = Field(
        description="The current active execution phase or status of the project lifecycle"
    )


class ProjectExpanded(Project):
    """
    Represents the full vertical lineage hierarchy from the project up to its operational field.
    """

    fields: FieldModel | None = Field(
        None, description="The nested field area details fetched via relation metadata"
    )


class ProjectCreate(ProjectBase):
    """
    Contract required to instantiate a new project workspace container inside the system.
    """

    status: StatusEnum = Field(
        StatusEnum.planning,
        description="The initial status constraint assigned during creation",
    )
    moment_note: str | None = Field(
        None,
        description="An optional historical tracking comment logged during initialization",
    )


class ProjectUpdate(BaseModel):
    """
    Payload blueprint allowing partial mutations over mutable project metadata variables.
    """

    name: str | None = Field(
        None, description="The revised title or name of the project container"
    )
    field_id: int | None = Field(
        None, description="The modified operational domain field identifier link"
    )
    due: str | None = Field(
        None,
        description="The rescheduled execution deadline timestamp formatted as YYYY-MM-DD",
    )
    priority: PriorityEnum | None = Field(
        None, description="The reassigned triage urgency prioritization level"
    )
    doc_reference: str | None = Field(
        None, description="The updated documentation reference address or track path"
    )
    moment_note: str | None = Field(
        None,
        description="Explanatory tracker summary log comment linked to this patch operation",
    )
