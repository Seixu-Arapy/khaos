from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError


async def supabase_api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """
    Catches and decodes structural database constraint breaches thrown by Postgrest.
    """
    error_code = getattr(exc, "code", None)
    message = getattr(exc, "message", str(exc))

    if error_code == "23503":
        message = "Foreign key violation: A provided parent entity ID does not exist."
    elif error_code == "23514":
        message = "Check constraint violation: Invalid value provided."
    elif error_code == "42501":
        message = "Permission denied: insufficient privileges for this operation."
    elif error_code == "23505":
        message = (
            "Unique constraint violation: A record with this value already exists."
        )

    return JSONResponse(
        status_code=400,
        content={"error": "DatabaseError", "code": error_code, "detail": message},
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Intercepts lifecycle HTTP client violations returning uniform JSON boundaries payloads.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "ClientError", "detail": exc.detail},
    )


async def google_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=502,
        content={"error": "AIProviderError", "provider": "google", "detail": str(exc)},
    )


async def anthropic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=502,
        content={
            "error": "AIProviderError",
            "provider": "anthropic",
            "detail": str(exc),
        },
    )


async def openai_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=502,
        content={"error": "AIProviderError", "provider": "openai", "detail": str(exc)},
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global catch-all safety net boundary layer capturing unhandled backend exceptions.
    """
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "detail": f"An unexpected error occurred: {str(exc)}",
        },
    )


def register_exception_handlers(app) -> None:
    """
    Binds concrete validation handlers mapping errors across the FastAPI application instance core context.
    """
    from anthropic import APIError as AnthropicAPIError
    from google.genai.errors import ServerError as GoogleServerError
    from openai import APIError as OpenAIAPIError

    app.add_exception_handler(APIError, supabase_api_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(GoogleServerError, google_error_handler)
    app.add_exception_handler(AnthropicAPIError, anthropic_error_handler)
    app.add_exception_handler(OpenAIAPIError, openai_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)
