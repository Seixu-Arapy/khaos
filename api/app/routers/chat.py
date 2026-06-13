from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat as chat_service

router = APIRouter(prefix="/chat", tags=["Chat Engine"])


@router.post(
    "/execution",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute localized core language model context prompt",
    description="Submit a chronological sequence of messages to the core language orchestration layer to process automated tool executions or rich text generation blocks.",
)
def execute_chat_context(payload: ChatRequest):
    """
    Process runtime chat execution prompts through polymorphic LLM drivers (Claude, Gemini, DeepSeek).
    Raises an HTTP 500 error if processing fails.
    """
    response = chat_service.process_chat_prompt(payload)

    if not response:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Language engine instance failed to yield a valid execution response block structure.",
        )

    return response
