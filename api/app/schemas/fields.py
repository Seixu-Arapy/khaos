from pydantic import BaseModel, Field


class FieldBase(BaseModel):
    name: str = Field(
        description="The unique semantic name of the operational area or core enterprise domain"
    )
    doc_reference: str | None = Field(
        None,
        description="External reference URL or path locator pointing to associated technical knowledge base documentation",
    )


class FieldModel(FieldBase):
    """
    Core framework representing a validated operational field structure with its database primary key identity.
    """

    id: int = Field(
        description="The unique automated sequential database primary key row identifier assigned to the field"
    )


class FieldCreate(FieldBase):
    """
    Data contract used to register and insert a new operational area domain into the infrastructure.
    """

    pass


class FieldUpdate(BaseModel):
    """
    Blueprint permitting partial property mutations over existing operational area records.
    """

    name: str | None = Field(
        None,
        description="The alternative unique semantic label chosen for this field domain area",
    )
    doc_reference: str | None = Field(
        None,
        description="The modified technical knowledge base documentation reference address location link",
    )
