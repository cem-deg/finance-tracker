"""Analytics API endpoints — powered by Pandas."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.analysis.aggregator import Aggregator
from app.analysis.predictor import Predictor

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dashboard summary with key financial metrics."""
    return Aggregator.summary(db, current_user.id)


@router.get("/monthly")
def monthly_totals(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Monthly spending totals for chart display."""
    return Aggregator.monthly_totals(db, current_user.id, months)


@router.get("/category-distribution")
def category_distribution(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Category spending distribution for pie chart."""
    return Aggregator.category_distribution(db, current_user.id, start_date, end_date)


@router.get("/trends")
def spending_trends(
    days: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Daily spending trend for line chart."""
    return Aggregator.daily_trend(db, current_user.id, days)


@router.get("/prediction")
def get_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ML-based next month spending prediction."""
    return Predictor.predict_next_month(db, current_user.id)


@router.get("/prediction/categories")
def get_category_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ML-based per-category spending predictions."""
    return Predictor.predict_by_category(db, current_user.id)
