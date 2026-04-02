"""Pydantic schemas for expenses."""

from datetime import date, datetime
from pydantic import BaseModel

from app.schemas.category import CategoryResponse


class ExpenseCreate(BaseModel):
    """Schema for creating a new expense."""
    amount: float
    description: str
    category_id: int
    expense_date: date
    currency_code: str = "USD"  # Default to USD


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense."""
    amount: float | None = None
    description: str | None = None
    category_id: int | None = None
    expense_date: date | None = None
    currency_code: str | None = None


class ExpenseResponse(BaseModel):
    """Schema for expense data returned to client."""
    id: int
    amount: float
    description: str
    expense_date: date
    category_id: int
    currency_code: str
    category: CategoryResponse
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    """Paginated list of expenses."""
    items: list[ExpenseResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
