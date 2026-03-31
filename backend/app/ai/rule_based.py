"""Rule-based insight generator — no external API needed (fallback)."""

from app.ai.base_provider import BaseAIProvider


class RuleBasedProvider(BaseAIProvider):
    """Generates insights using hardcoded financial rules."""

    def is_available(self) -> bool:
        return True

    def generate_insight(self, financial_data: dict) -> str:
        insights = []

        total_this = financial_data.get("total_this_month", 0)
        total_last = financial_data.get("total_last_month", 0)
        change = financial_data.get("month_change_percent", 0)
        top_cat = financial_data.get("top_category_name", "Unknown")
        avg_tx = financial_data.get("avg_per_transaction", 0)
        tx_count = financial_data.get("total_transactions", 0)
        highest = financial_data.get("highest_expense", 0)
        prediction = financial_data.get("prediction", None)

        # Month comparison
        if total_last > 0:
            if change > 20:
                insights.append(
                    f"⚠️ Your spending is up {change}% compared to last month. "
                    f"You spent ${total_this:.2f} this month vs ${total_last:.2f} last month."
                )
            elif change < -10:
                insights.append(
                    f"✅ Great job! You reduced spending by {abs(change)}% this month. "
                    f"${total_this:.2f} vs ${total_last:.2f} last month."
                )
            else:
                insights.append(
                    f"📊 Your spending is roughly stable: ${total_this:.2f} this month "
                    f"vs ${total_last:.2f} last month ({change:+.1f}%)."
                )
        elif total_this > 0:
            insights.append(
                f"📊 You've spent ${total_this:.2f} this month across {tx_count} transactions."
            )

        # Top category
        if top_cat and top_cat != "Unknown":
            insights.append(
            f"🏷️ Your top spending category this month is {top_cat}."
            )

        # Average transaction
        if avg_tx > 0:
            insights.append(
                f"💳 Your average transaction is ${avg_tx:.2f}."
            )

        # Highest expense
        if highest > 0:
            insights.append(
                f"📌 Your largest single expense this month was ${highest:.2f}."
            )

        # Prediction
        if prediction and prediction.get("prediction"):
            pred_val = prediction["prediction"]
            trend = prediction.get("trend", "stable")
            insights.append(
                f"🔮 Based on your history, we predict you'll spend approximately "
                f"${pred_val:.2f} next month (trend: {trend})."
            )

        if not insights:
            insights.append(
                "📝 Start adding expenses to get personalized insights!"
            )

        return "\n\n".join(insights)
