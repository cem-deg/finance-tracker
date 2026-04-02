"""Expense service — business logic for expense management."""

import math
from datetime import date

from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseListResponse


class ExpenseService:
    """Handles all expense-related operations."""

    @staticmethod
    def get_all(
        db: Session,
        user_id: int,
        page: int = 1,
        per_page: int = 20,
        category_id: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        min_amount: float | None = None,
        max_amount: float | None = None,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> ExpenseListResponse:
        """Return paginated, filtered, and sorted expenses."""
        query = (
            db.query(Expense)
            .options(joinedload(Expense.category))
            .filter(Expense.user_id == user_id)
        )

        # Apply filters
        if category_id:
            query = query.filter(Expense.category_id == category_id)
        if start_date:
            query = query.filter(Expense.expense_date >= start_date)
        if end_date:
            query = query.filter(Expense.expense_date <= end_date)
        if min_amount is not None:
            query = query.filter(Expense.amount >= min_amount)
        if max_amount is not None:
            query = query.filter(Expense.amount <= max_amount)

        # Count total
        total = query.count()

        # Apply sorting
        if sort_by == "amount":
            order_col = Expense.amount
        else:
            order_col = Expense.expense_date

        if sort_order == "asc":
            query = query.order_by(order_col)
        else:
            query = query.order_by(desc(order_col))

        # Apply pagination
        offset = (page - 1) * per_page
        items = query.offset(offset).limit(per_page).all()
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0

        return ExpenseListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    @staticmethod
    def get_by_id(db: Session, expense_id: int, user_id: int) -> Expense:
        """Return a single expense by ID, scoped to user."""
        expense = (
            db.query(Expense)
            .options(joinedload(Expense.category))
            .filter(Expense.id == expense_id, Expense.user_id == user_id)
            .first()
        )
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )
        return expense

    @staticmethod
    def create(db: Session, data: ExpenseCreate, user_id: int) -> Expense:
        """Create a new expense."""
        expense = Expense(
            amount=data.amount,
            description=data.description,
            category_id=data.category_id,
            expense_date=data.expense_date,
            currency_code=data.currency_code,
            user_id=user_id,
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        # Reload with category relationship
        return ExpenseService.get_by_id(db, expense.id, user_id)

    @staticmethod
    def update(
        db: Session, expense_id: int, data: ExpenseUpdate, user_id: int
    ) -> Expense:
        """Update an existing expense."""
        expense = (
            db.query(Expense)
            .filter(Expense.id == expense_id, Expense.user_id == user_id)
            .first()
        )
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(expense, field, value)
        db.commit()
        db.refresh(expense)
        return ExpenseService.get_by_id(db, expense.id, user_id)

    @staticmethod
    def delete(db: Session, expense_id: int, user_id: int) -> None:
        """Delete an expense."""
        expense = (
            db.query(Expense)
            .filter(Expense.id == expense_id, Expense.user_id == user_id)
            .first()
        )
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )
        db.delete(expense)
        db.commit()

    @staticmethod
    def get_recent(db: Session, user_id: int, limit: int = 5) -> list[Expense]:
        """Return the most recent expenses for dashboard."""
        return (
            db.query(Expense)
            .options(joinedload(Expense.category))
            .filter(Expense.user_id == user_id)
            .order_by(desc(Expense.expense_date), desc(Expense.created_at))
            .limit(limit)
            .all()
        )
