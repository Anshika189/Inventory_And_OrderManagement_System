"""
Application configuration.

Centralizes all runtime configuration loaded from environment variables.
Pydantic-settings validates values at startup so misconfiguration fails fast.
"""

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime application settings sourced from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "InventoryFlow Pro"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg2://postgres:postgres@localhost:5432/inventoryflow"
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # CORS — kept as a plain str so pydantic-settings doesn't try to
    # JSON-parse the value before our validator runs. The list form
    # is exposed via the `cors_origins_list` accessor.
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080"

    # Logging
    LOG_LEVEL: str = "INFO"

    @staticmethod
    def _parse_cors(v) -> List[str]:
        """Parse a comma-separated string, a JSON list, or an already-split list."""
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("["):
                import json
                parsed = json.loads(v)
                if not isinstance(parsed, list):
                    raise ValueError("BACKEND_CORS_ORIGINS JSON must be a list")
                return [str(x).strip() for x in parsed if str(x).strip()]
            return [item.strip() for item in v.split(",") if item.strip()]
        raise ValueError(f"Unsupported BACKEND_CORS_ORIGINS type: {type(v).__name__}")

    @property
    def cors_origins_list(self) -> List[str]:
        """Public accessor — returns BACKEND_CORS_ORIGINS as a list."""
        return self._parse_cors(self.BACKEND_CORS_ORIGINS)


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
