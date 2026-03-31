"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { insightsApi } from "@/services/api";
import type { InsightResponse } from "@/types";
import { Lightbulb, Sparkles, Cpu } from "lucide-react";

export default function InsightsPage() {
  const [mode, setMode] = useState<"rule" | "ai">("rule");
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    insightsApi.get(mode)
      .then((d) => setInsight(d as InsightResponse))
      .catch(() => setInsight(null))
      .finally(() => setLoading(false));
  }, [mode]);

  return (
    <AppShell>
      <div className="page-header animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Smart Insights</h1>
          <p>Personalized financial analysis and recommendations</p>
        </div>
        <div className="insight-mode-toggle">
          <button
            className={`insight-mode-btn ${mode === "rule" ? "active" : ""}`}
            onClick={() => setMode("rule")}
            id="mode-rule"
          >
            <Cpu size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            Rule-based
          </button>
          <button
            className={`insight-mode-btn ${mode === "ai" ? "active" : ""}`}
            onClick={() => setMode("ai")}
            id="mode-ai"
          >
            <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            AI Powered
          </button>
        </div>
      </div>

      <div className="animate-in animate-in-delay-1">
        {loading ? (
          <div className="card">
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-text" style={{ width: "100%" }} />
            <div className="skeleton skeleton-text" style={{ width: "90%" }} />
            <div className="skeleton skeleton-text" style={{ width: "85%" }} />
            <div className="skeleton skeleton-text" style={{ width: "70%" }} />
          </div>
        ) : (
          <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            {/* Decorative gradient */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: mode === "ai" ? "var(--gradient-primary)" : "var(--gradient-accent)",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: mode === "ai" ? "rgba(0, 210, 211, 0.15)" : "rgba(124, 106, 239, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: mode === "ai" ? "var(--accent-secondary)" : "var(--accent-primary-light)",
              }}>
                {mode === "ai" ? <Sparkles size={22} /> : <Lightbulb size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 700 }}>
                  {mode === "ai" ? "AI-Powered Insights" : "Financial Insights"}
                </h3>
                <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>
                  {insight?.provider === "gemini" ? "Powered by Google Gemini" : "Rule-based analysis"}
                </p>
              </div>
            </div>

            <div className="insight-card" style={{
              background: "var(--bg-elevated)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              {insight?.insight || "No insights available. Add some expenses to get started!"}
            </div>

            {mode === "ai" && (
              <button
                className="btn btn-secondary mt-lg"
                onClick={() => {
                  setLoading(true);
                  insightsApi.get("ai")
                    .then((d) => setInsight(d as InsightResponse))
                    .catch(() => {})
                    .finally(() => setLoading(false));
                }}
                id="regenerate-insights"
              >
                <Sparkles size={16} /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
