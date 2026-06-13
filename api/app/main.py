from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.auth import verify_bearer_token
from app.exceptions import register_exception_handlers
from app.routers import (
    chat,
    events,
    fields,
    health,
    moments,
    projects,
    sections,
    sequences,
    tags,
    tasks,
    time_entries,
)

app = FastAPI(
    title="Khaos API",
    description="Comprehensive automated workflow, audit ledger, and language engine management gateway.",
    version="1.0.0",
)

allowed_origins = [origin.strip() for origin in config.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)

register_exception_handlers(app)

protected_routers = [
    chat.router,
    events.router,
    fields.router,
    moments.router,
    projects.router,
    sections.router,
    sequences.router,
    tags.router,
    tasks.router,
    time_entries.router,
]

app.include_router(health.router)

for r in protected_routers:
    app.include_router(r, dependencies=[Depends(verify_bearer_token)])
