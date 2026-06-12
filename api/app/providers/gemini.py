import json

from google import genai
from google.genai import types

from app import config
from app.prompt import SYSTEM_PROMPT
from app.tools import TOOLS_SCHEMA, execute_tool

client = genai.Client(api_key=config.GEMINI_API_KEY)


def convert_tools():
    type_map = {"integer": types.Type.INTEGER, "string": types.Type.STRING}
    declarations = []
    for t in TOOLS_SCHEMA:
        properties = {}
        required = []
        for param_name, param in t["parameters"].items():
            properties[param_name] = types.Schema(
                type=type_map[param["type"]], description=param["description"]
            )
            if param.get("required"):
                required.append(param_name)
        declarations.append(
            types.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=types.Schema(
                    type=types.Type.OBJECT, properties=properties, required=required
                )
                if properties
                else types.Schema(type=types.Type.OBJECT, properties={}),
            )
        )
    return [types.Tool(function_declarations=declarations)]


def gemini(messages: list) -> str:
    """
    Executes a tool-enabled conversational session against the Gemini LLM engine.
    """
    tools = convert_tools()
    history = []
    for m in messages[:-1]:
        role = "user" if m["role"] == "user" else "model"
        history.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))

    last_message = messages[-1]["content"]
    contents = history + [
        types.Content(role="user", parts=[types.Part(text=last_message)])
    ]

    while True:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT, tools=tools
            ),
            contents=contents,
        )

        part = response.candidates[0].content.parts[0]

        if hasattr(part, "function_call") and part.function_call:
            fn = part.function_call
            result = execute_tool(fn.name, dict(fn.args))
            contents.append(types.Content(role="model", parts=[part]))
            contents.append(
                types.Content(
                    role="user",
                    parts=[
                        types.Part(
                            function_response=types.FunctionResponse(
                                name=fn.name, response={"result": json.dumps(result)}
                            )
                        )
                    ],
                )
            )
        else:
            return part.text
