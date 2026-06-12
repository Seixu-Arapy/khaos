import json

from openai import OpenAI

from app import config
from app.prompt import SYSTEM_PROMPT
from app.tools import TOOLS_SCHEMA, execute_tool

client = OpenAI(api_key=config.OPENAI_API_KEY, base_url="https://api.deepseek.com")


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


def deepseek(messages: list) -> str:
    """
    Executes a tool-enabled conversational session against the DeepSeek LLM engine.
    """
    tools = convert_tools()
    all_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    while True:
        response = client.chat.completions.create(
            model="deepseek-chat", messages=all_messages, tools=tools, max_tokens=1000
        )

        choice = response.choices[0]

        if choice.finish_reason == "tool_calls":
            all_messages.append(choice.message)
            for tool_call in choice.message.tool_calls:
                result = execute_tool(
                    tool_call.function.name, json.loads(tool_call.function.arguments)
                )
                all_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result),
                })
        else:
            return choice.message.content
