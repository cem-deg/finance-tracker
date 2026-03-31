"""Expense API endpoints."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.expense import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse,
)
from app.services.auth_service import get_current_user
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("/", response_model=ExpenseListResponse)
def list_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
    sort_by: str = Query("date", pattern="^(date|amount)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return paginated and filtered expenses."""
    return ExpenseService.get_all(
        db, current_user.id, page, per_page,
        category_id, start_date, end_date,
        min_amount, max_amount, sort_by, sort_order,
    )


@router.get("/recent", response_model=list[ExpenseResponse])
def recent_expenses(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the most recent expenses for the dashboard."""
    return ExpenseService.get_recent(db, current_user.id, limit)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a single expense by ID."""
    return ExpenseService.get_by_id(db, expense_id, current_user.id)


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new expense."""
    return ExpenseService.create(db, data, current_user.id)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing expense."""
    return ExpenseService.update(db, expense_id, data, current_user.id)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an expense."""
    ExpenseService.delete(db, expense_id, current_user.id)
