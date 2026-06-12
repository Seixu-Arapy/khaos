from fastapi import Header, HTTPException, Request

from app import config


def verify_api_key(request: Request, x_api_key: str | None = Header(None)) -> None:
    """
    Enforces perimeter security validation by evaluating incoming master header credentials.
    """
    if request.method == "OPTIONS":
        return

    if not x_api_key or x_api_key != config.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
