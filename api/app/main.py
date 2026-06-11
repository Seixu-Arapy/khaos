from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.exceptions import register_exception_handlers
from app.routers import (
    chat,
    events,
    fields,
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


@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Khaos is here."}


app.include_router(chat.router)
app.include_router(fields.router)
app.include_router(projects.router)
app.include_router(sections.router)
app.include_router(tasks.router)
app.include_router(events.router)
app.include_router(moments.router)
app.include_router(sequences.router)
app.include_router(tags.router)
app.include_router(time_entries.router)
