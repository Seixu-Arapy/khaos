FROM ghcr.io/astral-sh/uv:python3.12-alpine
WORKDIR /app
COPY . /app
RUN uv sync --frozen --no-dev
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
