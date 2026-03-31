"""Abstract base class for AI insight providers (Open-Closed Principle)."""

from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    """All AI providers must implement this interface."""

    @abstractmethod
    def generate_insight(self, financial_data: dict) -> str:
        """Generate a personalized financial insight from aggregated data.

        Args:
            financial_data: Dictionary with keys like total_this_month,
                category_distribution, trends, etc.

        Returns:
            A natural-language insight string.
        """
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this provider is configured and usable."""
        ...
