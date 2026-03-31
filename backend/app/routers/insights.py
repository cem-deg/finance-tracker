"""Smart Insights API endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.category import Category
from app.services.auth_service import get_current_user
from app.analysis.aggregator import Aggregator
from app.analysis.predictor import Predictor
from app.ai.rule_based import RuleBasedProvider
from app.ai.gemini_provider import GeminiProvider

router = APIRouter(prefix="/api/insights", tags=["Insights"])


def _build_financial_context(db: Session, user_id: int) -> dict:
    """Build a comprehensive financial data dict for AI providers."""
    summary = Aggregator.summary(db, user_id)
    prediction = Predictor.predict_next_month(db, user_id)
    monthly = Aggregator.monthly_totals(db, user_id, months=3)
    cat_dist = Aggregator.category_distribution(db, user_id)

    # Resolve category names
    categories = {c.id: c.name for c in db.query(Category).filter(Category.user_id == user_id).all()}

    top_cat_name = categories.get(summary.get("top_category_id"), "Unknown")

    cat_breakdown = "\n".join(
        f"- {categories.get(c['category_id'], 'Unknown')}: ${c['amount']:.2f} ({c['percentage']}%)"
        for c in cat_dist
    ) or "No data"

    monthly_trend = "\n".join(
        f"- {m['month']}: ${m['total']:.2f}" for m in monthly
    ) or "No data"

    pred_summary = "No prediction available"
    if prediction.get("prediction"):
        pred_summary = (
            f"Predicted: ${prediction['prediction']:.2f} "
            f"(confidence: {prediction['confidence']}, trend: {prediction.get('trend', 'N/A')})"
        )

    return {
        **summary,
        "top_category_name": top_cat_name,
        "category_breakdown": cat_breakdown,
        "monthly_trend": monthly_trend,
        "prediction": prediction,
        "prediction_summary": pred_summary,
    }


@router.get("/")
def get_insights(
    mode: str = Query("rule", pattern="^(rule|ai)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get smart financial insights (rule-based or AI-powered)."""
    context = _build_financial_context(db, current_user.id)

    if mode == "ai":
        provider = GeminiProvider()
        if provider.is_available():
            insight_text = provider.generate_insight(context)
            return {"mode": "ai", "provider": "gemini", "insight": insight_text}

    # Fallback to rule-based
    provider = RuleBasedProvider()
    insight_text = provider.generate_insight(context)
    return {"mode": "rule", "provider": "rule_based", "insight": insight_text}
