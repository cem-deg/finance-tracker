"use client";

import AppShell from "@/components/layout/AppShell";
import { useSummary, useRecentExpenses, useMonthlyTotals, useCategories } from "@/hooks/useData";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight,
  ArrowDownRight, ShoppingBag, Minus,
} from "lucide-react";

export default function DashboardPage() {
  const { summary, loading: summaryLoading } = useSummary();
  const { expenses: recent, loading: recentLoading } = useRecentExpenses(5);
  const { data: monthly, loading: monthlyLoading } = useMonthlyTotals(6);
  const { categories } = useCategories();

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const topCat = summary?.top_category_id ? catMap.get(summary.top_category_id) : null;

  const changeIsPositive = (summary?.month_change_percent ?? 0) > 0;

  return (
    <AppShell>
      <div className="page-header animate-in">
        <h1>Dashboard</h1>
        <p>Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-icon" style={{ background: "rgba(124,106,239,0.15)", color: "var(--accent-primary-light)" }}>
            <DollarSign size={22} />
          </div>
          {summaryLoading ? (
            <div className="skeleton skeleton-heading" />
          ) : (
            <>
              <div className="stat-value">{formatCurrency(summary?.total_this_month ?? 0)}</div>
              <div className="stat-label">Spent this month</div>
              <div className={`stat-change ${changeIsPositive ? "negative" : "positive"}`}>
                {changeIsPositive ? <ArrowUpRight size={14} /> : summary?.month_change_percent === 0 ? <Minus size={14} /> : <ArrowDownRight size={14} />}
                {formatPercent(summary?.month_change_percent ?? 0)}
              </div>
            </>
          )}
        </div>

        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-icon" style={{ background: "rgba(0,210,211,0.15)", color: "var(--accent-secondary)" }}>
            <CreditCard size={22} />
          </div>
          {summaryLoading ? (
            <div className="skeleton skeleton-heading" />
          ) : (
            <>
              <div className="stat-value">{summary?.total_transactions ?? 0}</div>
              <div className="stat-label">Transactions</div>
              <div className="stat-change positive" style={{ background: "rgba(0,210,211,0.1)", color: "var(--accent-secondary)" }}>
                Avg {formatCurrency(summary?.avg_per_transaction ?? 0)}
              </div>
            </>
          )}
        </div>

        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-icon" style={{ background: "rgba(255,107,107,0.15)", color: "var(--accent-danger)" }}>
            {changeIsPositive ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          </div>
          {summaryLoading ? (
            <div className="skeleton skeleton-heading" />
          ) : (
            <>
              <div className="stat-value">{formatCurrency(summary?.highest_expense ?? 0)}</div>
              <div className="stat-label">Highest expense</div>
            </>
          )}
        </div>

        <div className="stat-card animate-in animate-in-delay-4">
          <div className="stat-icon" style={{ background: topCat ? `${topCat.color}22` : "rgba(253,203,110,0.15)", color: topCat?.color || "var(--accent-warning)" }}>
            <ShoppingBag size={22} />
          </div>
          {summaryLoading ? (
            <div className="skeleton skeleton-heading" />
          ) : (
            <>
              <div className="stat-value" style={{ fontSize: "var(--font-xl)" }}>{topCat?.name || "—"}</div>
              <div className="stat-label">Top category</div>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="animate-in animate-in-delay-2">
          {monthlyLoading ? (
            <div className="card"><div className="skeleton" style={{ height: 300 }} /></div>
          ) : (
            <MonthlyBarChart data={monthly} />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card animate-in animate-in-delay-3">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <a href="/expenses" className="btn btn-ghost btn-sm">View all</a>
          </div>
          <div className="expense-list">
            {recentLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />
              ))
            ) : recent.length === 0 ? (
              <div className="empty-state" style={{ padding: "var(--space-xl)" }}>
                <p>No transactions yet. Add your first expense!</p>
              </div>
            ) : (
              recent.map((exp) => {
                const cat = catMap.get(exp.category_id);
                return (
                  <div key={exp.id} className="expense-item">
                    <div className="category-dot" style={{ background: cat?.color || "#636e72" }} />
                    <div className="expense-info">
                      <div className="expense-desc">{exp.description}</div>
                      <div className="expense-meta">{cat?.name || "Other"} · {new Date(exp.expense_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    </div>
                    <div className="expense-amount">-{formatCurrency(exp.amount)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
