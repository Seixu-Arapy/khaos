from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """
    Represents a single granular message log structure within a conversation thread.
    """

    role: str = Field(
        description="The author role identifier of this communication block (e.g., 'user', 'assistant', 'system')"
    )
    content: str = Field(
        description="The raw textual payload dialogue markdown content processed inside the transmission step"
    )


class ChatRequest(BaseModel):
    """
    Payload structure required to initiate or continue an asynchronous LLM model conversation streaming request.
    """

    model: Literal["claude", "gemini", "deepseek"] = Field(
        default="gemini",
        description="The targeted external core language engine identifier chosen to evaluate and process the conversational context prompt execution",
    )
    messages: list[ChatMessage] = Field(
        description="The complete sequential chat context history array listing records generated across the current thread session"
    )


class ChatResponse(BaseModel):
    """
    Structured model holding the final evaluated context response from the core language engine.
    """

    model: str = Field(
        description="The core language engine instance that processed the execution context prompt"
    )
    response: str = Field(
        description="The generated raw text or response block output resolved by the provider"
    )
