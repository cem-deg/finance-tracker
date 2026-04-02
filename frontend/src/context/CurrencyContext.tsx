"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", locale: "en-US", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", locale: "de-DE", flag: "🇪🇺" },
  { code: "TRY", symbol: "₺", locale: "tr-TR", flag: "🇹🇷" },
  { code: "GBP", symbol: "£", locale: "en-GB", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", flag: "🇯🇵" },
  { code: "KRW", symbol: "₩", locale: "ko-KR", flag: "🇰🇷" },
  { code: "CAD", symbol: "C$", locale: "en-CA", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", locale: "en-AU", flag: "🇦🇺" },
  { code: "CHF", symbol: "CHF", locale: "de-CH", flag: "🇨🇭" },
  { code: "INR", symbol: "₹", locale: "en-IN", flag: "🇮🇳" },
  { code: "BRL", symbol: "R$", locale: "pt-BR", flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$", locale: "es-MX", flag: "🇲🇽" },
  { code: "SEK", symbol: "kr", locale: "sv-SE", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", locale: "nb-NO", flag: "🇳🇴" },
  { code: "PLN", symbol: "zł", locale: "pl-PL", flag: "🇵🇱" },
  { code: "AED", symbol: "د.إ", locale: "ar-AE", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", locale: "ar-SA", flag: "🇸🇦" },
  { code: "RUB", symbol: "₽", locale: "ru-RU", flag: "🇷🇺" },
];

// Exchange rates relative to USD (1 USD = X CURRENCY)
// These are approximate rates and should be updated periodically
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  TRY: 32.50,
  GBP: 0.79,
  JPY: 150.0,
  KRW: 1320.0,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.88,
  INR: 83.20,
  BRL: 4.97,
  MXN: 17.05,
  SEK: 10.80,
  NOK: 10.65,
  PLN: 3.98,
  AED: 3.67,
  SAR: 3.75,
  RUB: 95.0,
};

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  convertAndFormat: (amount: number, fromCurrency: string, toCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[0]);
  const [rates, setRates] = useState<Record<string, number>>(EXCHANGE_RATES);

  // Load currency from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("datafle_currency");
    if (stored) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === stored);
      if (found) setCurrencyState(found);
    }
  }, []);

  // Fetch exchange rates from backend
  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange-rates`);
        if (response.ok) {
          const data = await response.json();
          setRates(data.rates || EXCHANGE_RATES);
        }
      } catch (err) {
        // Silently fail and use fallback rates
        console.debug("Using fallback exchange rates");
        setRates(EXCHANGE_RATES);
      }
    };

    fetchRates();
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = useCallback((code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyState(found);
      localStorage.setItem("datafle_currency", code);
    }
  }, []);

  const formatAmount = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
      }).format(amount);
    },
    [currency]
  );

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string) => {
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      // Convert from source currency to USD, then USD to target currency
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    },
    [rates]
  );

  const convertAndFormat = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string) => {
      const targetCurrency = toCurrency || currency.code;
      const convertedAmount = convertAmount(amount, fromCurrency, targetCurrency);
      
      const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency);
      if (!currencyInfo) return `${amount}`;

      return new Intl.NumberFormat(currencyInfo.locale, {
        style: "currency",
        currency: currencyInfo.code,
        minimumFractionDigits: currencyInfo.code === "JPY" || currencyInfo.code === "KRW" ? 0 : 2,
      }).format(convertedAmount);
    },
    [currency, convertAmount]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, convertAmount, convertAndFormat }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
