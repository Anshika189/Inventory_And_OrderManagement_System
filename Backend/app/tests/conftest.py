"""Test fixtures: in-memory SQLite engine + isolated sessions."""

from __future__ import annotations

import os
import uuid
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from app.core.config import settings  # noqa: E402
from app.database import base as base_module  # noqa: E402
from app.database import session as session_module  # noqa: E402
from app.database.base import Base  # noqa: E402
import app.models  # noqa: F401, E402
from app.main import create_app  # noqa: E402


@pytest.fixture(scope="session")
def engine():
    """In-memory SQLite engine shared across the session."""
    eng = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Enable FK enforcement on SQLite
    @event.listens_for(eng, "connect")
    def _fk_on(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

    Base.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def db(engine) -> Generator[Session, None, None]:
    """Per-test transactional session."""
    connection = engine.connect()
    transaction = connection.begin()
    TestingSession = sessionmaker(
        bind=connection, autoflush=False, autocommit=False, expire_on_commit=False
    )
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def app(monkeypatch, engine):
    """FastAPI app wired to the test engine."""

    TestingSession = sessionmaker(
        bind=engine, autoflush=False, autocommit=False, expire_on_commit=False
    )

    def _get_test_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    monkeypatch.setattr(session_module, "SessionLocal", TestingSession)
    monkeypatch.setattr(session_module, "get_db", _get_test_db)
    # Force re-evaluation of any cached config (no-op for our lru_cache but safe).
    base_module.Base.metadata = Base.metadata
    return create_app()


@pytest.fixture()
def client(app) -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def factory_id() -> str:
    return str(uuid.uuid4())
