from typing import NamedTuple

from pydantic import BaseModel, Field

from app.enums import PriorityEnum, StatusEnum

from .projects import ProjectExpanded


class SectionBase(BaseModel):
    name: str = Field(
        description="The descriptive structural title of the section column item"
    )
    project_id: int = Field(
        description="The parent workspace project unique system identifier reference"
    )
    due: str | None = Field(
        None, description="Section target milestone deadline formatted as YYYY-MM-DD"
    )
    priority: PriorityEnum | None = Field(
        None, description="The structural priority tier allocated to this board module"
    )
    doc_reference: str | None = Field(
        None,
        description="External reference path associated with this boards section assets",
    )


class Section(SectionBase):
    """
    Base record framework representing an active layout board column section milestone.
    """

    id: int = Field(
        description="The unique primary entity column tracking sequence key"
    )
    status: StatusEnum = Field(
        description="The structural flow workflow execution state of the board section"
    )


class SectionExpanded(Section):
    """
    Represents the full vertical lineage hierarchy from the section up to its parent project container.
    """

    projects: ProjectExpanded | None = Field(
        None, description="The full nested parent project hierarchical metadata chain"
    )


class SectionCreate(SectionBase):
    """
    Data contract specification used to append a section container milestone to a project.
    """

    status: StatusEnum = Field(
        StatusEnum.planning,
        description="The pipeline fallback execution status enforced upon record setup",
    )
    moment_note: str | None = Field(
        None,
        description="Optional system history note recorded during section layout creation",
    )


class SectionUpdate(BaseModel):
    """
    Data contract blueprint enabling patch properties updates on active section models.
    """

    name: str | None = Field(
        None,
        description="The alternative name definition chosen for this structural module",
    )
    due: str | None = Field(
        None,
        description="The rescheduled target milestone delivery parameter (YYYY-MM-DD)",
    )
    priority: PriorityEnum | None = Field(
        None, description="The updated workflow priority assignment level value"
    )
    doc_reference: str | None = Field(
        None, description="Revised documentation location locator or reference address"
    )
    moment_note: str | None = Field(
        None,
        description="Optional history tracking trace annotation summary for schema edits",
    )


class SectionSequence(NamedTuple):
    """
    Defines a structural layout sequence link between two workflow sections.

    This model governs the architectural continuity of the board, establishing
    which phase or structural container directly precedes another in the workflow pipeline.
    """

    SectionPrevious: int = Field(
        ...,
        description="The predecessor workflow step structural section identifier link.",
    )
    SectionNext: int = Field(
        ...,
        description="The layout continuation element sequence section identifier link that follows immediately after.",
    )


class SectionSequenced(SectionExpanded):
    """
    Extends the hierarchically expanded section model to include neutral horizontal sequence links matching the database structure exactly.
    """

    SectionPrevious: Section | None = Field(
        None,
        description="The structural section node positioned immediately before this element in the sequence timeline",
    )
    SectionNext: Section | None = Field(
        None,
        description="The structural section node positioned immediately after this element in the sequence timeline",
    )
