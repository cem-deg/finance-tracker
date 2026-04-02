"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { insightsApi } from "@/services/api";
import { useSummary, useCategoryDistribution, useCategories, useMonthlyTotals } from "@/hooks/useData";
import { useCurrency } from "@/context/CurrencyContext";
import type { InsightResponse } from "@/types";
import {
  Lightbulb, Sparkles, Cpu, TrendingUp, TrendingDown, AlertTriangle,
  Target, PiggyBank, Award, ArrowDown, Flame,
} from "lucide-react";

function SpendingHealthScore({ score, label }: { score: number; label: string }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "var(--accent-success)" : score >= 40 ? "var(--accent-warning)" : "var(--accent-danger)";

  return (
    <div className="health-score-card">
      <div className="score-ring">
        <svg viewBox="0 0 100 100">
          <circle className="ring-bg" cx="50" cy="50" r={r} />
          <circle className="ring-fill" cx="50" cy="50" r={r}
            stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
        <div className="score-text">
          <span className="score-value" style={{ color }}>{score}</span>
          <span className="score-label">Score</span>
        </div>
      </div>
      <div className="health-details">
        <h3>Financial Health</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [mode, setMode] = useState<"rule" | "ai">("rule");
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { summary } = useSummary();
  const { data: catDist } = useCategoryDistribution();
  const { categories } = useCategories();
  const { data: monthly } = useMonthlyTotals(3);
  const { convertAndFormat } = useCurrency();

  useEffect(() => {
    setLoading(true);
    insightsApi.get(mode)
      .then((d) => setInsight(d as InsightResponse))
      .catch(() => setInsight(null))
      .finally(() => setLoading(false));
  }, [mode]);

  // Calculate health score
  const change = summary?.month_change_percent ?? 0;
  const healthScore = Math.max(0, Math.min(100, Math.round(70 - change * 0.5)));
  const healthLabel = healthScore >= 70
    ? "You're doing great! Spending is well controlled this month."
    : healthScore >= 40
    ? "Room for improvement. Some categories are higher than usual."
    : "Spending is significantly higher than last month. Review your expenses.";

  // Build smart alerts
  const catMap = new Map(categories.map(c => [c.id, c]));
  const alerts: { icon: React.ReactNode; bg: string; color: string; title: string; desc: string }[] = [];

  if (change > 20) {
    alerts.push({
      icon: <Flame size={18} />, bg: "rgba(255,107,107,0.15)", color: "var(--accent-danger)",
      title: "Spending Spike Detected",
      desc: `Your spending is up ${change.toFixed(1)}% compared to last month. Consider reviewing recent transactions.`,
    });
  } else if (change < -10) {
    alerts.push({
      icon: <Award size={18} />, bg: "rgba(0,184,148,0.15)", color: "var(--accent-success)",
      title: "Great Savings!",
      desc: `You've reduced spending by ${Math.abs(change).toFixed(1)}% this month. Keep up the great work!`,
    });
  }

  // Find top spending category & savings opportunities
  const sortedCats = [...catDist].sort((a, b) => b.amount - a.amount);
  if (sortedCats.length > 0) {
    const topCat = catMap.get(sortedCats[0].category_id);
    const savingsTarget = sortedCats[0].amount * 0.15;
    if (topCat && sortedCats[0].percentage > 30) {
      alerts.push({
        icon: <Target size={18} />, bg: "rgba(253,203,110,0.15)", color: "var(--accent-warning)",
        title: `${topCat.name} is ${sortedCats[0].percentage}% of spending`,
        desc: `Reducing ${topCat.name} by 15% could save you ${convertAndFormat(savingsTarget, "USD")} this month.`,
      });
    }
  }

  if ((summary?.avg_per_transaction ?? 0) > 50) {
    alerts.push({
      icon: <AlertTriangle size={18} />, bg: "rgba(162,155,254,0.15)", color: "var(--accent-primary-light)",
      title: "High Average Transaction",
      desc: `Your average transaction is ${convertAndFormat(summary?.avg_per_transaction ?? 0, "USD")}. Splitting larger purchases could help track spending better.`,
    });
  }

  if (monthly.length >= 2) {
    const trend = monthly[monthly.length - 1]?.total > monthly[monthly.length - 2]?.total;
    alerts.push({
      icon: trend ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
      bg: trend ? "rgba(255,107,107,0.15)" : "rgba(0,184,148,0.15)",
      color: trend ? "var(--accent-danger)" : "var(--accent-success)",
      title: trend ? "Upward Spending Trend" : "Spending is Decreasing",
      desc: trend
        ? "Your monthly spending has been increasing. Setting a budget could help."
        : "Your monthly spending is trending downward. You're on the right track!",
    });
  }

  // Savings opportunities
  const savingsOpps = sortedCats.slice(0, 3).map(cat => {
    const name = catMap.get(cat.category_id)?.name ?? "Unknown";
    const color = catMap.get(cat.category_id)?.color ?? "#636e72";
    const potential = cat.amount * 0.1;
    return { name, color, current: cat.amount, potential, pct: cat.percentage };
  });

  return (
    <AppShell>
      <div className="page-header animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div><h1>Smart Insights</h1><p>Personalized financial analysis and recommendations</p></div>
        <div className="insight-mode-toggle">
          <button className={`insight-mode-btn ${mode === "rule" ? "active" : ""}`} onClick={() => setMode("rule")} id="mode-rule">
            <Cpu size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Rule-based
          </button>
          <button className={`insight-mode-btn ${mode === "ai" ? "active" : ""}`} onClick={() => setMode("ai")} id="mode-ai">
            <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />AI Powered
          </button>
        </div>
      </div>

      {/* Health Score + Savings */}
      <div className="insights-grid animate-in animate-in-delay-1">
        <SpendingHealthScore score={healthScore} label={healthLabel} />

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-md)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(0,184,148,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-success)" }}>
              <PiggyBank size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>Savings Opportunities</h3>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>Reduce top categories by 10%</p>
            </div>
          </div>
          {savingsOpps.length === 0 ? (
            <p style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)" }}>Add expenses to see savings opportunities</p>
          ) : savingsOpps.map((s) => (
            <div key={s.name} className="savings-item">
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: "var(--font-xs)", fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)" }}>{s.pct}%</div>
              </div>
              <div className="savings-bar-wrap">
                <div className="savings-bar" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--accent-success)", fontWeight: 600, whiteSpace: "nowrap" }}>
                <ArrowDown size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {convertAndFormat(s.potential, "USD")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Alerts */}
      <div className="animate-in animate-in-delay-2" style={{ marginBottom: "var(--space-lg)" }}>
        <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: "var(--space-md)" }}>Smart Alerts</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          {alerts.length === 0 ? (
            <div className="smart-alert">
              <div className="alert-icon" style={{ background: "rgba(124,106,239,0.15)", color: "var(--accent-primary-light)" }}>
                <Lightbulb size={18} />
              </div>
              <div className="alert-content">
                <div className="alert-title">No alerts yet</div>
                <div className="alert-desc">Add more expenses to get personalized alerts and recommendations.</div>
              </div>
            </div>
          ) : alerts.map((alert, i) => (
            <div key={i} className="smart-alert">
              <div className="alert-icon" style={{ background: alert.bg, color: alert.color }}>{alert.icon}</div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI / Rule-Based Insights */}
      <div className="animate-in animate-in-delay-3">
        {loading ? (
          <div className="card">
            <div className="skeleton skeleton-heading" /><div className="skeleton skeleton-text" style={{ width: "100%" }} />
            <div className="skeleton skeleton-text" style={{ width: "90%" }} /><div className="skeleton skeleton-text" style={{ width: "85%" }} />
          </div>
        ) : (
          <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: mode === "ai" ? "var(--gradient-primary)" : "var(--gradient-accent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: mode === "ai" ? "rgba(0, 210, 211, 0.15)" : "rgba(124, 106, 239, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: mode === "ai" ? "var(--accent-secondary)" : "var(--accent-primary-light)",
              }}>
                {mode === "ai" ? <Sparkles size={22} /> : <Lightbulb size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 700 }}>{mode === "ai" ? "AI-Powered Insights" : "Financial Insights"}</h3>
                <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                  {insight?.provider === "gemini" ? "Powered by Google Gemini" : "Rule-based analysis"}
                </p>
              </div>
            </div>
            <div className="insight-card" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {insight?.insight || "No insights available. Add some expenses to get started!"}
            </div>
            {mode === "ai" && (
              <button className="btn btn-secondary mt-lg" onClick={() => {
                setLoading(true);
                insightsApi.get("ai").then((d) => setInsight(d as InsightResponse)).catch(() => {}).finally(() => setLoading(false));
              }} id="regenerate-insights">
                <Sparkles size={16} /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
