"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getMonthName } from "@/utils/formatters";
import type { MonthlyTotal } from "@/types";

interface Props {
  data: MonthlyTotal[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--glass-border)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      fontSize: "var(--font-sm)",
    }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontWeight: 700 }}>${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function MonthlyBarChart({ data }: Props) {
  const chartData = data.map((d) => ({ ...d, name: getMonthName(d.month) }));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Monthly Spending</h3>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#8888a0", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8888a0", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c6aef" />
                <stop offset="100%" stopColor="#5a4fcf" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
