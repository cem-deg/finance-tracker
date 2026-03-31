"""Google Gemini AI provider for personalized financial insights."""

from google import genai

from app.ai.base_provider import BaseAIProvider
from app.config import settings


class GeminiProvider(BaseAIProvider):
    """Uses Google Gemini API to generate personalized financial insights."""

    def __init__(self):
        self._api_key = settings.GEMINI_API_KEY
        self._client = None
        if self._api_key:
            self._client = genai.Client(api_key=self._api_key)

    def is_available(self) -> bool:
        return bool(self._api_key and self._client)

    def generate_insight(self, financial_data: dict) -> str:
        if not self.is_available():
            return "AI insights unavailable — Gemini API key not configured."

        prompt = self._build_prompt(financial_data)

        try:
            response = self._client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            return response.text
        except Exception as e:
            return f"AI insight generation failed: {str(e)}"

    @staticmethod
    def _build_prompt(data: dict) -> str:
        """Build a detailed prompt for the Gemini model."""
        return f"""You are a smart personal finance advisor AI called Datafle Insights.
Analyze the following user's financial data and provide 3-5 actionable, personalized insights.

Be specific, data-driven, and helpful. Use emojis sparingly for readability.
Keep your response concise (under 300 words). Write in English.

## User's Financial Summary:
- Total spent this month: ${data.get('total_this_month', 0):.2f}
- Total spent last month: ${data.get('total_last_month', 0):.2f}
- Month-over-month change: {data.get('month_change_percent', 0):.1f}%
- Number of transactions: {data.get('total_transactions', 0)}
- Average per transaction: ${data.get('avg_per_transaction', 0):.2f}
- Highest single expense: ${data.get('highest_expense', 0):.2f}
- Top category: {data.get('top_category_name', 'N/A')}

## Category Breakdown:
{data.get('category_breakdown', 'No data available')}

## Spending Trend (last 3 months):
{data.get('monthly_trend', 'No data available')}

## ML Prediction:
{data.get('prediction_summary', 'No prediction available')}

Provide insights in the following format:
1. **Overall Assessment** — How is the user doing financially this month?
2. **Category Analysis** — Which categories need attention?
3. **Trend Analysis** — Is spending going up or down?
4. **Actionable Tip** — One specific thing the user can do to improve.
5. **Prediction Commentary** — Comment on the ML prediction if available."""
