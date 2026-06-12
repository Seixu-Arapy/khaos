from fastapi import APIRouter

from app.providers.claude import claude
from app.providers.deepseek import deepseek
from app.providers.gemini import gemini
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])


def parse_messages(request: ChatRequest) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in request.messages]


@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> dict:
    """
    Dispatches conversation historical payloads to the selected agent core service instance.
    """
    messages = parse_messages(request)

    if request.model == "claude":
        response = claude(messages)
    elif request.model == "deepseek":
        response = deepseek(messages)
    else:
        response = gemini(messages)

    return {"model": request.model, "response": response}
