"""Pydantic schemas for Product."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=64)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    stock_quantity: int = Field(..., ge=0)

    @field_validator("sku")
    @classmethod
    def _normalize_sku(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("sku must not be empty")
        return v

    @field_validator("name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be empty")
        return v


class ProductCreate(ProductBase):
    """Payload for creating a product."""


class ProductUpdate(BaseModel):
    """All fields optional for partial updates."""

    name: str | None = Field(default=None, min_length=1, max_length=200)
    sku: str | None = Field(default=None, min_length=1, max_length=64)
    price: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    stock_quantity: int | None = Field(default=None, ge=0)

    @field_validator("sku")
    @classmethod
    def _normalize_sku(cls, v: str | None) -> str | None:
        return v.strip().upper() if v else v

    @field_validator("name")
    @classmethod
    def _strip_name(cls, v: str | None) -> str | None:
        return v.strip() if v else v


class ProductRead(ProductBase):
    """Construct via ``model_validate(product)`` from a SQLAlchemy model.

    ``from_attributes=True`` is safe here because this schema is a *leaf*
    — it's not parameterized inside a generic envelope, so Pydantic
    doesn't try to walk SQLAlchemy relationship graphs.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class ProductSummary(BaseModel):
    """Lightweight projection for dashboard / list views.

    Construct via ``ProductSummary.model_validate({...})`` from a plain
    dict — keeps it decoupled from the SQLAlchemy ORM type graph.
    """

    id: UUID
    name: str
    sku: str
    price: Decimal
    stock_quantity: int


__all__ = ["ProductBase", "ProductCreate", "ProductUpdate", "ProductRead", "ProductSummary"]
