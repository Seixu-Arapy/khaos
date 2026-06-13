from fastapi import APIRouter

router = APIRouter(prefix="/healthz", tags=["Healtcheck"])


@router.get("/")
def health():
    """
    Simple verification check indicating system lifecycle live status.
    """
    return {"status": "ok"}
