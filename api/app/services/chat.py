"""
Chat Orchestration Service.

Handles the execution of conversational LLM logic by routing requests to
the specific driver module (Claude, Gemini, DeepSeek) based on user payload.
"""

from app.providers.claude import claude
from app.providers.deepseek import deepseek
from app.providers.gemini import gemini
from app.schemas.chat import ChatRequest, ChatResponse, ResponseBlock


def process_chat_prompt(payload: ChatRequest) -> ChatResponse:
    """
    Routes the message sequence history to the requested language engine instance,
    formats execution returns, and wraps them in a strict Pydantic model response.

    Args:
        payload (ChatRequest): Validated request object containing the message timeline
                               context and core model target.

    Returns:
        ChatResponse: Structured execution content array expected by the routing layer.
    """
    model_name = payload.model.lower()

    formatted_messages = [
        {"role": msg.role, "content": msg.content} for msg in payload.messages
    ]

    # Seleção polimórfica do motor de execução
    if "claude" in model_name:
        raw_result = claude(formatted_messages)
    elif "deepseek" in model_name:
        raw_result = deepseek(formatted_messages)
    elif "gemini" in model_name:
        raw_result = gemini(formatted_messages)
    else:
        # Fallback padrão caso venha um identificador genérico ou não mapeado
        raw_result = gemini(formatted_messages)

    # Extração dos blocos crus da resposta do assistente
    raw_blocks = raw_result.get("blocks", [])

    # Construção da lista de ResponseBlocks validando dinamicamente os tipos de blocos
    validated_blocks = []
    for block in raw_blocks:
        validated_blocks.append(
            ResponseBlock(
                type=block.get("type"),
                content=block.get("content"),
                name=block.get("name"),
                args=block.get("args"),
            )
        )

    # Devolve a estrutura final tipada exigida pela rota
    return ChatResponse(model=payload.model, blocks=validated_blocks)
