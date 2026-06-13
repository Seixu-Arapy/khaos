from typing import Any

import anthropic

from app import config
from app.prompt import SYSTEM_PROMPT
from app.tools import execute_tool, generate_tools_schema

client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
_CLAUDE_TOOLS_CACHE = None


def convert_tools() -> list:
    """
    Converts the static tool schema definitions into the structured layout
    required by the Anthropic Claude messages API execution parameter.
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
            "name": t["name"],
            "description": t["description"],
            "input_schema": {
                "type": "object",
                "properties": properties,
                "required": required,
            },
        })
    return tools


def claude(messages: list) -> dict[str, Any]:
    """
    Executes a tool-enabled conversational session against the Claude LLM engine
    utilizing pre-compiled and cached system tools schema.
    """
    global _CLAUDE_TOOLS_CACHE
    if _CLAUDE_TOOLS_CACHE is None:
        _CLAUDE_TOOLS_CACHE = convert_tools()

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        tools=_CLAUDE_TOOLS_CACHE,
        messages=messages,
    )

    blocks = []

    while response.stop_reason == "tool_use":
        tool_results = []

        for block in response.content:
            if block.type == "text":
                blocks.append({"type": "text", "content": block.text})
            elif block.type == "thinking":
                blocks.append({"type": "thinking", "content": block.thinking})
            elif block.type == "redacted_thinking":
                blocks.append({
                    "type": "thinking",
                    "content": "Thinking hidden by system",
                })
            elif block.type == "tool_use":
                blocks.append({
                    "type": "tool_use",
                    "name": block.name,
                    "args": block.input,
                })

                result = execute_tool(block.name, block.input)
                blocks.append({"type": "terminal", "content": str(result)})

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            tools=_CLAUDE_TOOLS_CACHE,
            messages=messages,
        )

    for block in response.content:
        if block.type == "text":
            blocks.append({"type": "text", "content": block.text})
        elif block.type == "thinking":
            blocks.append({"type": "thinking", "content": block.thinking})
        elif block.type == "redacted_thinking":
            blocks.append({"type": "thinking", "content": "Thinking hidden by system"})
        elif block.type == "tool_use":
            blocks.append({
                "type": "tool_use",
                "name": block.name,
                "args": block.input,
            })

    if blocks:
        return {"role": "assistant", "blocks": blocks}

    return {
        "role": "assistant",
        "blocks": [{"type": "text", "content": "No response received."}],
    }
