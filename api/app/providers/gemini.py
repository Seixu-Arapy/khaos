import json
from functools import lru_cache
from typing import Any

from google import genai
from google.genai import types

from app import config
from app.prompt import SYSTEM_PROMPT
from app.tools import execute_tool, generate_tools_schema

client = genai.Client(api_key=config.GEMINI_API_KEY)


@lru_cache(maxsize=1)
def get_cached_tools_declaration() -> list[types.Tool] | None:
    """
    Generate and cache the OpenAPI schemas translated into Gemini function declarations.

    Returns:
        list[types.Tool] | None: A cached list containing the structured Tool definitions,
                                 or None if no functional endpoints are exposed.
    """
    type_map = {
        "integer": types.Type.INTEGER,
        "string": types.Type.STRING,
        "boolean": types.Type.BOOLEAN,
    }

    try:
        active_tools = generate_tools_schema()
    except Exception:
        active_tools = []

    if not active_tools:
        return None

    declarations = []
    for t in active_tools:
        if not isinstance(t, dict):
            continue

        properties = {}
        required = []

        parameters_map = t.get("parameters", {})
        if isinstance(parameters_map, dict):
            for param_name, param in parameters_map.items():
                if isinstance(param, dict):
                    param_type = param.get("type", "string")
                    param_desc = param.get("description", "")
                    if param.get("required"):
                        required.append(param_name)
                else:
                    param_type = str(param)
                    param_desc = ""

                properties[param_name] = types.Schema(
                    type=type_map.get(param_type, types.Type.STRING),
                    description=param_desc,
                )

        declarations.append(
            types.FunctionDeclaration(
                name=t.get("name", ""),
                description=t.get("description", ""),
                parameters=types.Schema(
                    type=types.Type.OBJECT, properties=properties, required=required
                )
                if properties
                else types.Schema(type=types.Type.OBJECT, properties={}),
            )
        )

    # CORREÇÃO AQUI: O novo SDK espera que você passe a lista de declarações
    # diretamente para a inicialização do types.Tool sem a chave nomeada antiga.
    return [types.Tool(function_declarations=declarations)] if declarations else None


def gemini(messages: list[Any]) -> dict[str, list[dict[str, Any]]]:
    """
    Executes a tool-enabled conversational loop session against the Gemini LLM engine.

    Args:
        messages (list[Any]): Sequential list of historical conversation logs.

    Returns:
        dict[str, list[dict[str, Any]]]: Compliant dict structure containing the sequence of output blocks.
    """
    if not messages:
        return {"blocks": [{"type": "text", "content": ""}]}

    tools = get_cached_tools_declaration()

    history = []
    for m in messages[:-1]:
        if isinstance(m, dict):
            role = "user" if m.get("role") == "user" else "model"
            content_text = m.get("content", "")
        else:
            role = "user"
            content_text = str(m)

        history.append(
            types.Content(role=role, parts=[types.Part.from_text(text=content_text)])
        )

    last_msg_node = messages[-1]
    last_message = (
        last_msg_node.get("content", "")
        if isinstance(last_msg_node, dict)
        else str(last_msg_node)
    )

    contents = history + [
        types.Content(role="user", parts=[types.Part.from_text(text=last_message)])
    ]

    while True:
        try:
            response = client.models.generate_content(
                model="gemini-3.1-flash-lite",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT, tools=tools
                ),
                contents=contents,
            )

            candidate = response.candidates[0] if response.candidates else None
            parts = candidate.content.parts if candidate and candidate.content else None
            part = parts[0] if parts else None

            if not part:
                return {
                    "blocks": [
                        {
                            "type": "text",
                            "content": "Gemini Engine Error: Received empty payload.",
                        }
                    ]
                }

            if hasattr(part, "function_call") and part.function_call:
                fn = part.function_call

                tool_name = str(fn.name) if fn.name else ""
                if not tool_name:
                    return {
                        "blocks": [
                            {
                                "type": "text",
                                "content": "Gemini Engine Error: Null tool execution identifier.",
                            }
                        ]
                    }

                extracted_args = fn.args if isinstance(fn.args, dict) else {}
                result = execute_tool(tool_name, extracted_args)

                contents.append(types.Content(role="model", parts=[part]))
                contents.append(
                    types.Content(
                        role="user",
                        parts=[
                            types.Part(
                                function_response=types.FunctionResponse(
                                    name=tool_name,
                                    response={"result": json.dumps(result)},
                                )
                            )
                        ],
                    )
                )
            else:
                return {"blocks": [{"type": "text", "content": part.text or ""}]}

        except Exception as e:
            return {
                "blocks": [
                    {"type": "text", "content": f"Gemini Engine Error: {str(e)}"}
                ]
            }
