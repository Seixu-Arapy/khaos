from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError

# ============================================================
# SUPABASE / POSTGRES
# ============================================================


async def supabase_api_error_handler(request: Request, exc: APIError):
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


# ============================================================
# HTTP (FastAPI)
# ============================================================


async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "ClientError", "detail": exc.detail},
    )


# ============================================================
# AI PROVIDERS
# ============================================================


async def google_error_handler(request: Request, exc: Exception):
    message = str(exc)
    status_code = 502

    if "503" in message or "UNAVAILABLE" in message:
        detail = "Gemini is currently unavailable due to high demand. Please try again in a moment or switch to another model."
        status_code = 503
    elif "429" in message or "RESOURCE_EXHAUSTED" in message:
        detail = (
            "Gemini quota exceeded. Please try again later or switch to another model."
        )
        status_code = 429
    elif "401" in message or "UNAUTHENTICATED" in message:
        detail = "Gemini authentication failed. Check your GEMINI_API_KEY."
        status_code = 401
    else:
        detail = f"Gemini error: {message}"

    return JSONResponse(
        status_code=status_code,
        content={"error": "AIProviderError", "provider": "gemini", "detail": detail},
    )


async def anthropic_error_handler(request: Request, exc: Exception):
    message = str(exc)
    status_code = 502

    if "529" in message or "overloaded" in message.lower():
        detail = "Claude is currently overloaded. Please try again in a moment or switch to another model."
        status_code = 503
    elif "429" in message or "rate_limit" in message.lower():
        detail = "Claude rate limit exceeded. Please try again later."
        status_code = 429
    elif "401" in message or "authentication" in message.lower():
        detail = "Claude authentication failed. Check your ANTHROPIC_API_KEY."
        status_code = 401
    else:
        detail = f"Claude error: {message}"

    return JSONResponse(
        status_code=status_code,
        content={"error": "AIProviderError", "provider": "claude", "detail": detail},
    )


async def openai_error_handler(request: Request, exc: Exception):
    message = str(exc)
    status_code = 502

    if "503" in message or "unavailable" in message.lower():
        detail = "DeepSeek is currently unavailable. Please try again in a moment or switch to another model."
        status_code = 503
    elif "429" in message or "rate_limit" in message.lower():
        detail = "DeepSeek rate limit exceeded. Please try again later."
        status_code = 429
    elif "402" in message or "insufficient" in message.lower():
        detail = "DeepSeek insufficient balance. Please top up your account."
        status_code = 402
    elif "401" in message or "authentication" in message.lower():
        detail = "DeepSeek authentication failed. Check your DEEPSEEK_API_KEY."
        status_code = 401
    else:
        detail = f"DeepSeek error: {message}"

    return JSONResponse(
        status_code=status_code,
        content={"error": "AIProviderError", "provider": "deepseek", "detail": detail},
    )


# ============================================================
# GENERIC FALLBACK
# ============================================================


async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "detail": f"An unexpected error occurred: {str(exc)}",
        },
    )


# ============================================================
# REGISTRATION HELPER
# ============================================================


def register_exception_handlers(app):
    from anthropic import APIError as AnthropicAPIError
    from google.genai.errors import ServerError as GoogleServerError
    from openai import APIError as OpenAIAPIError

    app.add_exception_handler(APIError, supabase_api_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(GoogleServerError, google_error_handler)
    app.add_exception_handler(AnthropicAPIError, anthropic_error_handler)
    app.add_exception_handler(OpenAIAPIError, openai_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)
