from pydantic import BaseModel, Field


class TagBase(BaseModel):
    name: str = Field(
        description="The unique textual string descriptor serving as a searchable semantic tag classification label"
    )
    synonyms: list[str] = Field(
        default=[],
        description="An array listing linguistic or lookup alternative variations mapped directly onto this master text label tag context",
    )


class Tag(TagBase):
    """
    Master categorical taxonomy data unit tracking global semantic tags across system layers.
    """

    id: int = Field(
        description="The core internal indexing primary handle tracking the unique systemic identity of this tag resource record"
    )


class TagCreate(TagBase):
    """
    Contract used to register a new semantic tag classification label within the platform domain index.
    """

    pass


class TagEntityBinding(BaseModel):
    """
    Abstract relational contract framework mapping catalog metadata associations over system rows entities.
    """

    entity_type: str = Field(
        description="The destination domain database collection name indicator being categorized by the active label link"
    )
    entity_id: int = Field(
        description="The concrete target entity unique row identity sequence key receiving this metadata lookup association profile"
    )


class WorkTagEntity(TagEntityBinding):
    """
    Operational assignment schema mapping work layouts classifications links directly over workspace active entries.
    """

    work_tag_id: int = Field(
        description="The master work profile catalog tag table sequence primary tracking key component identifier"
    )


class MomentTagEntity(TagEntityBinding):
    """
    Analytical historical audit mapping binding specialized metadata context tags onto individual audit transition logs rows.
    """

    moment_tag_id: int = Field(
        description="The master analytical audit profile catalog tag registry table primary tracking key component identifier"
    )
