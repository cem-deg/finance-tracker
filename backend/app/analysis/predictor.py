"""ML-based expense predictor using scikit-learn Linear Regression."""

from datetime import date, timedelta

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from app.models.expense import Expense


class Predictor:
    """Provides simple ML-based spending predictions."""

    @staticmethod
    def _load_monthly_data(db: Session, user_id: int) -> pd.DataFrame:
        """Load and aggregate expenses by month for ML training."""
        expenses = (
            db.query(Expense.amount, Expense.expense_date)
            .filter(Expense.user_id == user_id)
            .all()
        )

        if not expenses:
            return pd.DataFrame(columns=["month_num", "total"])

        df = pd.DataFrame(expenses, columns=["amount", "expense_date"])
        df["expense_date"] = pd.to_datetime(df["expense_date"])
        df["month"] = df["expense_date"].dt.to_period("M")
        monthly = df.groupby("month")["amount"].sum().reset_index()
        monthly = monthly.sort_values("month")
        monthly["month_num"] = range(len(monthly))
        monthly["total"] = monthly["amount"]

        return monthly[["month_num", "total"]]

    @staticmethod
    def predict_next_month(db: Session, user_id: int) -> dict:
        """Predict next month's total spending using Linear Regression."""
        monthly = Predictor._load_monthly_data(db, user_id)

        if len(monthly) < 3:
            return {
                "prediction": None,
                "confidence": "low",
                "message": "Not enough data. Need at least 3 months of history.",
                "data_points": len(monthly),
            }

        # Using numpy polyfit instead of importing sklearn (lighter)
        X = monthly["month_num"].values
        y = monthly["total"].values

        # Linear regression: y = mx + b
        coefficients = np.polyfit(X, y, 1)
        slope, intercept = coefficients

        # Predict next month
        next_month_num = X[-1] + 1
        prediction = slope * next_month_num + intercept
        prediction = max(prediction, 0)  # Can't predict negative spending

        # R² score for confidence
        y_pred = np.polyval(coefficients, X)
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        if r_squared > 0.7:
            confidence = "high"
        elif r_squared > 0.4:
            confidence = "medium"
        else:
            confidence = "low"

        # Trend
        if slope > 0:
            trend = "increasing"
        elif slope < 0:
            trend = "decreasing"
        else:
            trend = "stable"

        return {
            "prediction": round(float(prediction), 2),
            "confidence": confidence,
            "r_squared": round(float(r_squared), 3),
            "trend": trend,
            "slope": round(float(slope), 2),
            "data_points": len(monthly),
            "message": f"Based on {len(monthly)} months of data, predicted spending is ${prediction:.2f}",
        }

    @staticmethod
    def predict_by_category(db: Session, user_id: int) -> list[dict]:
        """Predict next month's spending per category."""
        expenses = (
            db.query(Expense.amount, Expense.expense_date, Expense.category_id)
            .filter(Expense.user_id == user_id)
            .all()
        )

        if not expenses:
            return []

        df = pd.DataFrame(expenses, columns=["amount", "expense_date", "category_id"])
        df["expense_date"] = pd.to_datetime(df["expense_date"])
        df["month"] = df["expense_date"].dt.to_period("M")

        predictions = []
        for cat_id in df["category_id"].unique():
            cat_df = df[df["category_id"] == cat_id]
            monthly = cat_df.groupby("month")["amount"].sum().reset_index()
            monthly = monthly.sort_values("month")

            if len(monthly) < 2:
                avg = float(monthly["amount"].mean())
                predictions.append({
                    "category_id": int(cat_id),
                    "prediction": round(avg, 2),
                    "confidence": "low",
                })
                continue

            X = np.arange(len(monthly))
            y = monthly["amount"].values
            coefficients = np.polyfit(X, y, 1)
            next_val = np.polyval(coefficients, len(monthly))
            next_val = max(float(next_val), 0)

            predictions.append({
                "category_id": int(cat_id),
                "prediction": round(next_val, 2),
                "confidence": "medium" if len(monthly) >= 3 else "low",
            })

        return predictions
