"""Pydantic schemas for Customer."""

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_PHONE_RE = re.compile(r"^[+0-9\-\s().]{6,32}$")


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=32)

    @field_validator("full_name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("full_name must not be empty")
        return v

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if v and not _PHONE_RE.match(v):
            raise ValueError("phone format is invalid")
        return v or None


class CustomerCreate(CustomerBase):
    """Payload for creating a customer."""


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=32)

    @field_validator("full_name")
    @classmethod
    def _strip_name(cls, v: str | None) -> str | None:
        return v.strip() if v else v

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if v and not _PHONE_RE.match(v):
            raise ValueError("phone format is invalid")
        return v or None


class CustomerRead(CustomerBase):
    """Construct via ``model_validate(customer)`` from a SQLAlchemy model.

    ``from_attributes=True`` is safe here because this schema is a *leaf*
    — it's not parameterized inside a generic envelope, so Pydantic
    doesn't try to walk SQLAlchemy relationship graphs.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


__all__ = ["CustomerBase", "CustomerCreate", "CustomerUpdate", "CustomerRead"]
