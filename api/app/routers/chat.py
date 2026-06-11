from fastapi import APIRouter

from app.models import ChatRequest
from app.providers.claude import chat as chat_claude
from app.providers.deepseek import chat as chat_deepseek
from app.providers.gemini import chat as chat_gemini

router = APIRouter(prefix="/chat", tags=["Chat"])


def parse_messages(request: ChatRequest):
    return [{"role": m.role, "content": m.content} for m in request.messages]


@router.post("")
def chat_endpoint(request: ChatRequest):
    messages = parse_messages(request)
    if request.model == "claude":
        response = chat_claude(messages)
    elif request.model == "gemini":
        response = chat_gemini(messages)
    elif request.model == "deepseek":
        response = chat_deepseek(messages)
    return {"model": request.model, "response": response}
