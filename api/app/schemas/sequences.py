from pydantic import BaseModel, Field


class TaskSequence(BaseModel):
    task_previous: int = Field(
        description="The dependency predecessor task unit key ID"
    )
    task_next: int = Field(
        description="The downstream block dependent consumer successor task target ID"
    )


class SectionSequence(BaseModel):
    section_previous: int = Field(
        description="The predecessor workflow step structural section identifier link"
    )
    section_next: int = Field(
        description="The layout continuation element sequence section identifier link"
    )
