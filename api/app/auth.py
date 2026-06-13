from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app import config

security_scheme = HTTPBearer(auto_error=False)


def verify_bearer_token(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(security_scheme)
    ],
):
    """
    Enforces perimeter security validation by evaluating incoming official
    Authorization: Bearer <token> credentials.
    """
    if request.method == "OPTIONS":
        return

    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Invalid or missing access token")

    token = credentials.credentials
    if token != config.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing access token")
