from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.auth import verify_api_key
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

app = FastAPI(title="Khaos API")

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
    fields.router,
    projects.router,
    sections.router,
    tasks.router,
    sequences.router,
    events.router,
    moments.router,
    tags.router,
    time_entries.router,
]

for r in protected_routers:
    app.include_router(r, dependencies=[Depends(verify_api_key)])

app.include_router(health.router)
