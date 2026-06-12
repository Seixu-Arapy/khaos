import anthropic

from app import config
from app.prompt import SYSTEM_PROMPT
from app.tools import TOOLS_SCHEMA, execute_tool

client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)


def convert_tools() -> list:
    tools = []
    for t in TOOLS_SCHEMA:
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


def claude(messages: list) -> str:
    """
    Executes a tool-enabled conversational session against the Claude LLM engine.
    """
    tools = convert_tools()

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        tools=tools,
        messages=messages,
    )

    while response.stop_reason == "tool_use":
        tool_uses = [b for b in response.content if b.type == "tool_use"]
        tool_results = []

        for tool_use in tool_uses:
            result = execute_tool(tool_use.name, tool_use.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": str(result),
            })

        messages = messages + [
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": tool_results},
        ]

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            tools=tools,
            messages=messages,
        )

    return response.content[0].text
