from datetime import datetime

from pydantic import BaseModel, Field


class MomentBase(BaseModel):
    entity_type: str = Field(
        description="The target domain model database collection name being audited"
    )
    entity_id: int = Field(
        description="The matching database primary key row tracking index identifier belonging to the targeted domain entity"
    )
    event_type: str = Field(
        description="The specific lifecycle event type transition metric descriptor tracking state mutations"
    )
    value: str | None = Field(
        None,
        description="The updated state variable value registered across the tracking state machine transition step",
    )
    moment_note: str | None = Field(
        None,
        description="Neutral contextual annotation remarks logged down to explain the background of this timeline event record",
    )


class Moment(MomentBase):
    """
    Audit log footprint tracking precise structural lifecycle history data modifications inside the application domain.
    """

    id: int = Field(
        description="The unique historical transaction primary tracking index sequence key stored in the audit ledger"
    )
    time: datetime = Field(
        description="The precise automated transaction timestamp marking the entry registration of this historical state change"
    )


class MomentCreate(MomentBase):
    """
    Contract required to explicitly record and append a lifecycle status audit trail footprint into the tracking engine database.
    """

    pass
