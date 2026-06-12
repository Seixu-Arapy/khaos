import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

ENVIRONMENT: str = os.getenv("ENVIRONMENT", "staging")

API_HOST: str = os.getenv("KHAOS_API_HOST", "127.0.0.1")
API_PORT: int = int(os.getenv("KHAOS_API_PORT", "8000"))
API_URL: str = os.getenv("KHAOS_API_URL", f"https://{API_HOST}:{API_PORT}")

API_KEY: str = os.getenv("KHAOS_API_KEY", secrets.token_hex(32))

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "https://localhost:5173")
