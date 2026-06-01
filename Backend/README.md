# InventoryFlow Pro · Backend

FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Alembic + PostgreSQL.

## Local dev

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Bring up Postgres (or use docker-compose)
docker compose up -d postgres

alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

Open <http://localhost:8000/docs>.

## Tests

```bash
pytest -q
```

## Project layout

```
app/
├── api/          # HTTP routes
├── core/         # config, exceptions, security
├── database/     # engine, session, base
├── models/       # SQLAlchemy ORM
├── repositories/ # Data access
├── schemas/      # Pydantic models
├── services/     # Business logic
├── tests/        # Pytest suite
└── main.py       # FastAPI factory
```

## Useful commands

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Roll back one step
alembic downgrade -1

# Re-seed (idempotent)
python scripts/seed.py
```
