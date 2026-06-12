from pydantic import BaseModel, Field


class EventBase(BaseModel):
    title: str = Field(
        description="The descriptive topic name or schedule header of the calendar event"
    )
    type: str = Field(
        description="The specific classifier category layout designation assigned to the event block"
    )
    start_at: str = Field(
        description="ISO-8601 string timestamp representing the exact kickoff timeline schedule"
    )
    end_at: str = Field(
        description="ISO-8601 string timestamp representing the expected execution completion marker"
    )
    task_id: int | None = Field(
        None,
        description="An optional relational hook reference tying the event to a single task unit",
    )
    project_id: int | None = Field(
        None,
        description="An optional layout anchor linking this timeline event block to a parent project",
    )
    field_id: int | None = Field(
        None,
        description="An optional operational mapping domain identifier reference filter value",
    )
    recurrent: bool = Field(
        False,
        description="Binary toggle asserting whether this event recurrence schedule pattern systematically repeats",
    )


class Event(EventBase):
    """
    A concrete calendar system timeline block allocation record.
    """

    id: int = Field(
        description="The automated structural primary tracking index identifier database sequence"
    )


class EventCreate(EventBase):
    """
    Payload validation format used to plot an event block placeholder in the system.
    """

    moment_note: str | None = Field(
        None,
        description="Metadata audit remarks written down into historical moments logs tracking records setup",
    )


class EventUpdate(BaseModel):
    """
    Blueprint defining the update parameters allowed when reshaping an event entry dataset.
    """

    title: str | None = Field(
        None, description="The modified calendar event title text definition statement"
    )
    start_at: str | None = Field(
        None,
        description="Revised ISO-8601 layout start timeline schedule variable value",
    )
    end_at: str | None = Field(
        None,
        description="Revised ISO-8601 layout targeted completion boundary milestone mark",
    )
    recurrent: bool | None = Field(
        None,
        description="Overriding indicator state tracking adjustments to recurring rules behaviors",
    )
    moment_note: str | None = Field(
        None,
        description="Context tracking summary documentation tracking patches modifications manually",
    )
