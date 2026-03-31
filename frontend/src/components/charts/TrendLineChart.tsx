"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area,
} from "recharts";
import { formatDateShort } from "@/utils/formatters";
import type { DailyTrend } from "@/types";

interface Props {
  data: DailyTrend[];
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

export default function TrendLineChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    name: formatDateShort(d.date),
  }));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Spending Trend</h3>
        <span className="badge badge-primary">Last 30 days</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d2d3" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00d2d3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#8888a0", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#8888a0", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" fill="url(#lineGradient)" stroke="none" />
            <Line type="monotone" dataKey="total" stroke="#00d2d3" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#00d2d3", stroke: "var(--bg-primary)", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
