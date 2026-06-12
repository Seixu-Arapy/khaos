import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

ENVIRONMENT = os.getenv("ENVIROMENT", "staging")

API_HOST = os.getenv("KHAOS_API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("KHAOS_API_PORT", "8000"))
API_URL = os.getenv("KHAOS_API_URL", f"http://{API_HOST}:{API_PORT}")

API_KEY = os.environ.get("KHAOS_API_KEY", secrets.token_hex(32))

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
