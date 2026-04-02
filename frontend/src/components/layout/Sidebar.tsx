"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/context/CurrencyContext";
import { NAV_ITEMS, APP_NAME } from "@/utils/constants";
import {
  LayoutDashboard, Wallet, BarChart3, Lightbulb, Tags,
  LogOut, TrendingUp, Sun, Moon, Settings, ChevronDown,
  Calendar, Globe, X,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "layout-dashboard": <LayoutDashboard size={20} />,
  wallet: <Wallet size={20} />,
  "bar-chart-3": <BarChart3 size={20} />,
  lightbulb: <Lightbulb size={20} />,
  tags: <Tags size={20} />,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  return (
    <>
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><TrendingUp size={18} /></div>
          <h1>{APP_NAME}</h1>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? "active" : ""}`}>
                {iconMap[item.icon]}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div style={{ padding: "0 var(--space-md)", marginBottom: "var(--space-sm)" }}>
          <button className="theme-toggle w-full" onClick={toggleTheme} title="Toggle theme" id="theme-toggle-sidebar"
            style={{ width: "100%", justifyContent: "center", gap: 8, fontSize: "var(--font-xs)", fontWeight: 500 }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Profile Section */}
        <div className="sidebar-footer">
          <div className="profile-panel">
            <div className="sidebar-user" onClick={() => setProfileExpanded(!profileExpanded)} style={{ margin: 0, padding: 0 }}>
              <div className="avatar">{initial}</div>
              <div className="user-info">
                <div className="user-name">{user?.name || "User"}</div>
                <div className="user-email">{user?.email || ""}</div>
              </div>
              <ChevronDown size={16} style={{
                color: "var(--text-tertiary)", transition: "transform 200ms ease",
                transform: profileExpanded ? "rotate(180deg)" : "rotate(0)"
              }} />
            </div>

            {profileExpanded && (
              <div className="profile-expanded">
                <div className="profile-detail">
                  <Calendar size={14} />
                  <span>Member since {memberSince}</span>
                </div>
                <div className="profile-detail">
                  <Globe size={14} />
                  <span>{currency.flag} {currency.code}</span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-md)", justifyContent: "center", alignItems: "center" }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: "var(--font-xs)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onClick={() => setShowSettings(true)}>
                    <Settings size={14} /> Settings
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: "var(--accent-danger)", fontSize: "var(--font-xs)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    onClick={logout} id="logout-btn">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-xl)" }}>
              <h2 className="modal-title">Settings</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowSettings(false)}><X size={20} /></button>
            </div>

            <div className="settings-section">
              <h3>Currency</h3>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-sm)" }}>
                Select your preferred currency for displaying amounts
              </p>
              <div className="currency-grid">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <div key={c.code}
                    className={`currency-option ${currency.code === c.code ? "selected" : ""}`}
                    onClick={() => setCurrency(c.code)}>
                    <span className="currency-flag">{c.flag}</span>
                    <span>{c.code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Theme</h3>
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "center" }}>
                <button className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { toggleTheme(); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Moon size={16} /> Dark
                </button>
                <button className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { toggleTheme(); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Sun size={16} /> Light
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
