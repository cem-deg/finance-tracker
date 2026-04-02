"""Exchange rate service for currency conversion."""

import os
from datetime import datetime, timedelta
import requests
from app.config import settings


# Fallback rates (used if API is unavailable)
FALLBACK_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "TRY": 32.50,
    "GBP": 0.79,
    "JPY": 150.0,
    "KRW": 1320.0,
    "CAD": 1.36,
    "AUD": 1.52,
    "CHF": 0.88,
    "INR": 83.20,
    "BRL": 4.97,
    "MXN": 17.05,
    "SEK": 10.80,
    "NOK": 10.65,
    "PLN": 3.98,
    "AED": 3.67,
    "SAR": 3.75,
    "RUB": 95.0,
}


class ExchangeRateService:
    """Manages currency exchange rates."""
    
    # Cache rates in memory with timestamp
    _cached_rates: dict | None = None
    _cache_time: datetime | None = None
    _cache_duration = timedelta(hours=1)  # Cache for 1 hour
    
    @classmethod
    def get_rates(cls, base_currency: str = "USD") -> dict:
        """
        Get exchange rates relative to base currency.
        Returns a dict like: {"USD": 1.0, "EUR": 0.92, "TRY": 32.50, ...}
        """
        # Check if cache is still valid
        if cls._cached_rates and cls._cache_time:
            if datetime.now() - cls._cache_time < cls._cache_duration:
                return cls._cached_rates
        
        # Try to fetch from API
        api_key = settings.EXCHANGE_API_KEY
        
        if api_key:
            rates = cls._fetch_from_api(base_currency, api_key)
            if rates:
                cls._cached_rates = rates
                cls._cache_time = datetime.now()
                return rates
        
        # Fallback to hardcoded rates
        return FALLBACK_RATES
    
    @classmethod
    def _fetch_from_api(cls, base_currency: str, api_key: str) -> dict | None:
        """
        Fetch rates from exchangerate-api.com.
        API Endpoint: https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{BASE_CURRENCY}
        """
        try:
            url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/{base_currency}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            
            # Check for API error
            if data.get("result") == "error":
                return None
            
            # Extract rates from response
            if "conversion_rates" in data:
                return data["conversion_rates"]
            
            return None
            
        except requests.exceptions.RequestException:
            return None
        except Exception:
            return None
    
    @classmethod
    def convert(cls, amount: float, from_currency: str, to_currency: str) -> float:
        """Convert amount from one currency to another."""
        rates = cls.get_rates(from_currency)
        
        from_rate = rates.get(from_currency, 1.0)
        to_rate = rates.get(to_currency, 1.0)
        
        # Convert to USD if from_currency != USD, then convert USD to target
        usd_amount = amount / from_rate
        return usd_amount * to_rate


# Singleton instance
exchange_service = ExchangeRateService()
