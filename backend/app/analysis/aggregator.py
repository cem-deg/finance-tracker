"""Pandas-based data aggregation for expense analytics."""

from datetime import date, timedelta
from collections import defaultdict

import pandas as pd
from sqlalchemy.orm import Session

from app.models.expense import Expense


class Aggregator:
    """Aggregates raw expense data into analytics-ready structures."""

    @staticmethod
    def _load_expenses_df(db: Session, user_id: int) -> pd.DataFrame:
        """Load user expenses from DB into a Pandas DataFrame."""
        expenses = (
            db.query(
                Expense.id,
                Expense.amount,
                Expense.description,
                Expense.expense_date,
                Expense.category_id,
            )
            .filter(Expense.user_id == user_id)
            .all()
        )

        if not expenses:
            return pd.DataFrame(
                columns=["id", "amount", "description", "expense_date", "category_id"]
            )

        df = pd.DataFrame(expenses, columns=["id", "amount", "description", "expense_date", "category_id"])
        df["expense_date"] = pd.to_datetime(df["expense_date"])
        return df

    @staticmethod
    def monthly_totals(db: Session, user_id: int, months: int = 12) -> list[dict]:
        """Calculate total spending per month for the last N months."""
        df = Aggregator._load_expenses_df(db, user_id)
        if df.empty:
            return []

        # Use year-month string grouping (Pandas 3.0 compatible)
        df["month_str"] = df["expense_date"].dt.strftime("%Y-%m")
        grouped = df.groupby("month_str")["amount"].sum().to_dict()

        # Fill missing months with 0
        today = date.today()
        result = []
        for i in range(months - 1, -1, -1):
            d = today.replace(day=1) - timedelta(days=i * 30)
            month_key = d.strftime("%Y-%m")
            result.append({
                "month": month_key,
                "total": round(float(grouped.get(month_key, 0)), 2),
            })

        return result

    @staticmethod
    def category_distribution(
        db: Session,
        user_id: int,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict]:
        """Calculate spending distribution across categories."""
        df = Aggregator._load_expenses_df(db, user_id)
        if df.empty:
            return []

        if start_date:
            df = df[df["expense_date"] >= pd.Timestamp(start_date)]
        if end_date:
            df = df[df["expense_date"] <= pd.Timestamp(end_date)]

        if df.empty:
            return []

        grouped = df.groupby("category_id")["amount"].sum().reset_index()
        total = grouped["amount"].sum()
        grouped["percentage"] = round(grouped["amount"] / total * 100, 1)

        return grouped.to_dict("records")

    @staticmethod
    def daily_trend(db: Session, user_id: int, days: int = 30) -> list[dict]:
        """Calculate daily spending trend for the last N days."""
        df = Aggregator._load_expenses_df(db, user_id)
        if df.empty:
            return []

        cutoff = pd.Timestamp(date.today() - timedelta(days=days))
        df = df[df["expense_date"] >= cutoff]

        if df.empty:
            return []

        df["date_str"] = df["expense_date"].dt.strftime("%Y-%m-%d")
        grouped = df.groupby("date_str")["amount"].sum().to_dict()

        # Fill missing days
        result = []
        for i in range(days, -1, -1):
            d = date.today() - timedelta(days=i)
            key = d.strftime("%Y-%m-%d")
            result.append({
                "date": key,
                "total": round(float(grouped.get(key, 0)), 2),
            })

        return result

    @staticmethod
    def summary(db: Session, user_id: int) -> dict:
        """Generate a dashboard summary with key metrics."""
        df = Aggregator._load_expenses_df(db, user_id)
        if df.empty:
            return {
                "total_this_month": 0,
                "total_last_month": 0,
                "month_change_percent": 0,
                "total_transactions": 0,
                "avg_per_transaction": 0,
                "top_category_id": None,
                "highest_expense": 0,
            }

        today = date.today()
        this_month_start = today.replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        this_month = df[df["expense_date"] >= pd.Timestamp(this_month_start)]
        last_month = df[
            (df["expense_date"] >= pd.Timestamp(last_month_start))
            & (df["expense_date"] <= pd.Timestamp(last_month_end))
        ]

        total_this = float(this_month["amount"].sum())
        total_last = float(last_month["amount"].sum())

        if total_last > 0:
            change = round((total_this - total_last) / total_last * 100, 1)
        else:
            change = 100.0 if total_this > 0 else 0.0

        top_cat = None
        if not this_month.empty:
            top_cat = int(
                this_month.groupby("category_id")["amount"].sum().idxmax()
            )

        return {
            "total_this_month": round(total_this, 2),
            "total_last_month": round(total_last, 2),
            "month_change_percent": change,
            "total_transactions": len(this_month),
            "avg_per_transaction": round(
                total_this / len(this_month), 2
            ) if len(this_month) > 0 else 0,
            "top_category_id": top_cat,
            "highest_expense": round(
                float(this_month["amount"].max()), 2
            ) if not this_month.empty else 0,
        }
