"""
FastAPI application factory.

Wires routers, exception handlers, CORS, and startup hooks together.
The factory pattern keeps the app easily testable and deployable.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api import customers, dashboard, orders, products
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import HTTP_401_HEADERS
from app.database.session import engine

logger = logging.getLogger("inventoryflow")
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Lightweight startup check — verifies the DB is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection OK")
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("Database connection failed at startup: %s", exc)
    yield
    logger.info("Shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        description=(
            "InventoryFlow Pro — Modern Inventory & Order Management Platform"
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(products.router, prefix=settings.API_V1_PREFIX)
    app.include_router(customers.router, prefix=settings.API_V1_PREFIX)
    app.include_router(orders.router, prefix=settings.API_V1_PREFIX)
    app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)

    # Health check
    @app.get("/health", tags=["Health"], summary="Liveness probe")
    def health() -> dict:
        db_ok = True
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception:  # pragma: no cover
            db_ok = False
        return {"status": "ok" if db_ok else "degraded", "db": db_ok}

    # ---- Exception handlers -------------------------------------------
    @app.exception_handler(AppException)
    async def _app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
                "code": exc.code,
                "errors": exc.errors,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Validation failed",
                "code": "validation_error",
                "errors": [
                    {
                        "field": ".".join(str(p) for p in err.get("loc", []) if p != "body"),
                        "message": err.get("msg"),
                        "type": err.get("type"),
                    }
                    for err in exc.errors()
                ],
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        headers = getattr(exc, "headers", None) or {}
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            headers = {**HTTP_401_HEADERS, **headers}
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": str(exc.detail),
                "code": "http_error",
                "errors": [],
            },
            headers=headers,
        )

    @app.exception_handler(Exception)
    async def _unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Internal server error",
                "code": "internal_error",
                "errors": [],
            },
        )

    return app


app = create_app()
