import json
from typing import Any, cast

from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam

from app import config
from app.prompt import SYSTEM_PROMPT
from app.tools import execute_tool, generate_tools_schema

client = OpenAI(api_key=config.OPENAI_API_KEY, base_url="https://api.deepseek.com")


def convert_tools() -> list:
    """
    Converts the static system tools metadata specifications into the functional
    layout array expected by standard OpenAI compatible endpoints.
    """
    tools = []
    for t in generate_tools_schema():
        properties = {}
        required = []
        for param_name, param in t["parameters"].items():
            properties[param_name] = {
                "type": param["type"],
                "description": param["description"],
            }
            if param.get("required"):
                required.append(param_name)
        tools.append({
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required,
                },
            },
        })
    return tools


CACHED_DEEPSEEK_TOOLS = convert_tools()


def deepseek(messages: list) -> dict[str, Any]:
    """
    Executes a multi-turn tool calling orchestration execution chain
    against the backend DeepSeek language inference model instance.
    """
    base_messages: list[ChatCompletionMessageParam] = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    all_messages = base_messages + cast(list[ChatCompletionMessageParam], messages)

    blocks = []

    while True:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=all_messages,
            tools=CACHED_DEEPSEEK_TOOLS,
        )

        choice = response.choices[0]
        if choice.finish_reason == "tool_calls":
            message_dict = cast(ChatCompletionMessageParam, choice.message.model_dump())
            all_messages.append(message_dict)

            if choice.message.tool_calls:
                for tool_call in choice.message.tool_calls:
                    tool_func = getattr(tool_call, "function", None)
                    if not tool_func:
                        continue

                    tool_name = tool_func.name
                    tool_args = json.loads(tool_func.arguments)

                    blocks.append({
                        "type": "tool_use",
                        "name": tool_name,
                        "args": tool_args,
                    })

                    result = execute_tool(tool_name, tool_args)
                    blocks.append({"type": "terminal", "content": str(result)})

                    tool_message: ChatCompletionMessageParam = {
                        "role": "tool",
                        "tool_call_id": getattr(tool_call, "id", ""),
                        "content": json.dumps(result),
                    }
                    all_messages.append(tool_message)
        else:
            final_text = choice.message.content or ""
            if final_text:
                blocks.append({"type": "text", "content": final_text})

            if blocks:
                return {"role": "assistant", "blocks": blocks}

            return {
                "role": "assistant",
                "blocks": [{"type": "text", "content": "No response received."}],
            }
