"use client";

import AppShell from "@/components/layout/AppShell";
import { useMonthlyTotals, useCategoryDistribution, useTrends, useCategories, usePrediction } from "@/hooks/useData";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import { formatCurrency } from "@/utils/formatters";
import { BrainCircuit, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function AnalyticsPage() {
  const { data: monthly, loading: mLoading } = useMonthlyTotals(12);
  const { data: catDist, loading: cLoading } = useCategoryDistribution();
  const { data: trends, loading: tLoading } = useTrends(30);
  const { categories } = useCategories();
  const { prediction, loading: pLoading } = usePrediction();

  return (
    <AppShell>
      <div className="page-header animate-in">
        <h1>Analytics</h1>
        <p>Deep dive into your spending patterns</p>
      </div>

      {/* Prediction Card */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "var(--space-xl)" }}>
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-icon" style={{ background: "rgba(124,106,239,0.15)", color: "var(--accent-primary-light)" }}>
            <BrainCircuit size={22} />
          </div>
          {pLoading ? (
            <div className="skeleton skeleton-heading" />
          ) : prediction?.prediction ? (
            <>
              <div className="stat-value">{formatCurrency(prediction.prediction)}</div>
              <div className="stat-label">Predicted next month</div>
              <div className={`stat-change ${prediction.trend === "increasing" ? "negative" : "positive"}`}>
                {prediction.trend === "increasing" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {prediction.trend} · {prediction.confidence} confidence
              </div>
            </>
          ) : (
            <>
              <div className="stat-value" style={{ fontSize: "var(--font-lg)" }}>Need more data</div>
              <div className="stat-label">{prediction?.message || "Add expenses to get predictions"}</div>
            </>
          )}
        </div>

        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-icon" style={{ background: "rgba(0,210,211,0.15)", color: "var(--accent-secondary)" }}>
            <Target size={22} />
          </div>
          {pLoading ? (
            <div className="skeleton skeleton-heading" />
          ) : (
            <>
              <div className="stat-value">{prediction?.data_points ?? 0}</div>
              <div className="stat-label">Months of data</div>
              <div className="badge badge-primary" style={{ marginTop: 8 }}>
                R² = {prediction?.r_squared?.toFixed(3) ?? "—"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid animate-in animate-in-delay-2">
        {mLoading ? (
          <div className="card"><div className="skeleton" style={{ height: 300 }} /></div>
        ) : (
          <MonthlyBarChart data={monthly} />
        )}

        {cLoading ? (
          <div className="card"><div className="skeleton" style={{ height: 300 }} /></div>
        ) : (
          <CategoryPieChart data={catDist} categories={categories} />
        )}
      </div>

      {/* Trend Chart - Full Width */}
      <div className="animate-in animate-in-delay-3">
        {tLoading ? (
          <div className="card"><div className="skeleton" style={{ height: 300 }} /></div>
        ) : (
          <TrendLineChart data={trends} />
        )}
      </div>
    </AppShell>
  );
}
