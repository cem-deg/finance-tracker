"""Pydantic schemas for categories."""

from datetime import datetime
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""
    name: str
    icon: str = "circle"
    color: str = "#6c5ce7"


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category."""
    name: str | None = None
    icon: str | None = None
    color: str | None = None


class CategoryResponse(BaseModel):
    """Schema for category data returned to client."""
    id: int
    name: str
    icon: str
    color: str
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}
