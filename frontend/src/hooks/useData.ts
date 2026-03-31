"use client";

import { useState, useEffect, useCallback } from "react";
import { expenseApi, categoryApi, analyticsApi } from "@/services/api";
import type {
  Expense, Category, ExpenseList, DashboardSummary,
  MonthlyTotal, CategoryDistribution, DailyTrend, Prediction,
} from "@/types";

/**
 * Hook for fetching expenses with filters and pagination.
 */
export function useExpenses(params?: Record<string, string | number>) {
  const [data, setData] = useState<ExpenseList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseApi.getAll(params) as ExpenseList;
      setData(res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching recent expenses.
 */
export function useRecentExpenses(limit = 5) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setExpenses(await expenseApi.getRecent(limit) as Expense[]);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { expenses, loading, refetch: fetch };
}

/**
 * Hook for fetching categories.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await categoryApi.getAll() as Category[]);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, loading, refetch: fetch };
}

/**
 * Hook for dashboard summary.
 */
export function useSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getSummary()
      .then((d) => setSummary(d as DashboardSummary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading };
}

/**
 * Hook for monthly totals chart data.
 */
export function useMonthlyTotals(months = 12) {
  const [data, setData] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getMonthly(months)
      .then((d) => setData(d as MonthlyTotal[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [months]);

  return { data, loading };
}

/**
 * Hook for category distribution chart data.
 */
export function useCategoryDistribution() {
  const [data, setData] = useState<CategoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getCategoryDistribution()
      .then((d) => setData(d as CategoryDistribution[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

/**
 * Hook for daily spending trends.
 */
export function useTrends(days = 30) {
  const [data, setData] = useState<DailyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getTrends(days)
      .then((d) => setData(d as DailyTrend[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return { data, loading };
}

/**
 * Hook for ML prediction.
 */
export function usePrediction() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPrediction()
      .then((d) => setPrediction(d as Prediction))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { prediction, loading };
}
