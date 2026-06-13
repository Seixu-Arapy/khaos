import asyncio
import concurrent.futures
import inspect
import sys
from typing import Any

from fastapi.routing import APIRoute


def _get_runtime_routes() -> list:
    """
    Safely retrieves the active FastAPI application routes from the localized
    sys modules registry to prevent compile-time dependency loops.
    """
    main_module = sys.modules.get("app.main")
    if not main_module:
        return []

    app_instance = getattr(main_module, "app", None)
    if not app_instance:
        return []

    return getattr(app_instance, "routes", [])


def generate_tools_schema() -> list[dict[str, Any]]:
    """
    Dynamically extracts application route metadata to build an OpenAPI-compliant
    JSON schema for language model tool execution.
    """
    routes = _get_runtime_routes()
    schemas = {}

    main_module = sys.modules.get("app.main")
    if main_module:
        app_instance = getattr(main_module, "app", None)
        if app_instance:
            openapi = app_instance.openapi()
            schemas = openapi.get("components", {}).get("schemas", {})

    tools = []

    for route in routes:
        if not isinstance(route, APIRoute):
            continue

        operation_id = route.unique_id
        path = route.path
        method = list(route.methods)[0].lower() if route.methods else "get"

        if method == "options":
            continue

        if main_module and app_instance:
            spec = app_instance.openapi().get("paths", {}).get(path, {}).get(method, {})
        else:
            spec = {}

        if not spec:
            continue

        parameters = {}
        for p in spec.get("parameters", []):
            schema = p.get("schema", {})
            parameters[p["name"]] = {
                "type": schema.get("type", "string"),
                "description": p.get("description", ""),
                "required": p.get("required", False),
            }

        body = spec.get("requestBody")
        if body:
            json_content = body.get("content", {}).get("application/json", {})
            ref = json_content.get("schema", {}).get("$ref") or json_content.get(
                "schema", {}
            ).get("allOf", [{}])[0].get("$ref")
            if ref:
                model_name = ref.split("/")[-1]
                model_schema = schemas.get(model_name, {})
                required_fields = model_schema.get("required", [])
                for field_name, field_spec in model_schema.get(
                    "properties", {}
                ).items():
                    parameters[field_name] = {
                        "type": field_spec.get("type", "string"),
                        "description": field_spec.get("description", ""),
                        "required": field_name in required_fields,
                    }

        tools.append({
            "name": operation_id,
            "description": spec.get("description") or spec.get("summary", ""),
            "parameters": parameters,
        })

    return tools


def execute_tool(name: str, inputs: dict[str, Any]) -> Any:
    """
    Resolves an action execution identifier to a targeted runtime API endpoint route,
    filtering parameter inputs and executing synchronously or asynchronously.
    """
    routes = _get_runtime_routes()
    target_route = None

    for route in routes:
        if isinstance(route, APIRoute) and (
            route.unique_id == name
            or getattr(route, "operation_id", None) == name
            or route.endpoint.__name__ == name
        ):
            target_route = route
            break

    if not target_route:
        return {
            "error": "ToolNotFound",
            "detail": f"The requested automation identifier '{name}' was not located within the functional runtime index.",
        }

    try:
        endpoint_func = target_route.endpoint
        sig = inspect.signature(endpoint_func)

        has_kwargs = any(
            p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values()
        )

        filtered_inputs = {}
        if has_kwargs:
            filtered_inputs = inputs
        else:
            for param_name, _param in sig.parameters.items():
                if param_name in inputs:
                    filtered_inputs[param_name] = inputs[param_name]

        if asyncio.iscoroutinefunction(endpoint_func):
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            if loop.is_running():
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    future = pool.submit(asyncio.run, endpoint_func(**filtered_inputs))
                    result = future.result()
            else:
                result = loop.run_until_complete(endpoint_func(**filtered_inputs))
        else:
            result = endpoint_func(**filtered_inputs)

        if hasattr(result, "model_dump"):
            return result.model_dump()
        return result

    except TimeoutError:
        return {
            "error": "TimeoutError",
            "detail": "The automation execution exceeded the maximum allocated time window and was aborted.",
        }
    except Exception as e:
        return {"error": "ExecutionError", "detail": str(e)}
