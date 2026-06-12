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

# ============================================================
# MIDDLEWARE
# ============================================================

allowed_origins = [origin.strip() for origin in config.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# EXCEPTION HANDLERS
# ============================================================

register_exception_handlers(app)

# ============================================================
# ROUTERS
# ============================================================


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
