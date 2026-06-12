from pydantic import BaseModel, Field


class TimeEntryBase(BaseModel):
    task_id: int = Field(
        description="The fundamental relational anchor linking this operational duration recording session to an action item"
    )


class TimeEntry(TimeEntryBase):
    """
    Structured timeline data chunk record storing precise information regarding tracked duration sessions.
    """

    id: int = Field(
        description="The unique sequence database record primary index key tracking this specific operational time tracking slot entry"
    )
    started_at: str = Field(
        description="The ISO-8601 string timestamp metadata tracking when this specific execution recording session was kicked off"
    )
    ended_at: str | None = Field(
        None,
        description="The ISO-8601 string payload tracking when the active user stopped recording effort tracking metrics for this slot",
    )


class TimeEntryCreate(TimeEntryBase):
    """
    Payload parameters utilized to trigger or inject a time tracking segment record manually or automatically.
    """

    moment_note: str | None = Field(
        None,
        description="Explanatory baseline comment detailing the operational context behind the allocation of this execution timer segment",
    )


class TimeEntryUpdate(BaseModel):
    """
    Blueprint specifying the allowed mutations available when reviewing or correcting recorded time duration segments datasets.
    """

    started_at: str | None = Field(
        None,
        description="Audited override value to retroactively adjust the initial kickoff timestamp entry point parameter",
    )
    ended_at: str | None = Field(
        None,
        description="Audited override value to manually set or shift the end closure timestamp boundary metrics tracking record",
    )
    task_id: int | None = Field(
        None,
        description="An alternative operational workspace task identifier reference used to transfer this time metric tracking data allocation slot",
    )
