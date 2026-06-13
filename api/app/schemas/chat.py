from typing import Any

from pydantic import BaseModel, Field


class ResponseBlock(BaseModel):
    """
    Represents an individual content block within the chat engine response stream.

    This model unifies various output fragments produced by different LLM engines
    (Claude, DeepSeek, Gemini) and local execution runtimes, enabling the React
    frontend to dynamically render polymorphic UI components.
    """

    type: str = Field(
        ...,
        description=(
            "The block architectural type identifier. Determines the rendering strategy "
            "on the client side. Common values include: 'text', 'thinking', 'tool_use', and 'terminal'."
        ),
    )
    content: str | None = Field(
        None,
        description=(
            "The raw text payload associated with the block. Populated for standard text "
            "generation ('text'), chain-of-thought steps ('thinking'), or automation execution outputs ('terminal')."
        ),
    )
    name: str | None = Field(
        None,
        description=(
            "The identifier of the invoked tool/automation. "
            "This field is required only when the 'type' evaluates to 'tool_use'."
        ),
    )
    args: dict[str, Any] | None = Field(
        None,
        description=(
            "The structured key-value arguments mapped to the tool execution signature. "
            "This field is required only when the 'type' evaluates to 'tool_use'."
        ),
    )


class ChatResponse(BaseModel):
    """
    Unified execution response model encapsulating the final evaluated context
    returned by any core language engine integration.
    """

    model: str = Field(
        ...,
        description="The unique identifier of the language engine instance that processed the execution context prompt.",
    )
    blocks: list[ResponseBlock] = Field(
        ...,
        description="The chronological sequence of structured rich content blocks making up the complete assistant answer.",
    )


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
