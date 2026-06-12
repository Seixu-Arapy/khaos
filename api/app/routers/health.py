from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
def health():
    """
    Simple verification check indicating system lifecycle live status.
    """
    return {"status": "ok"}
