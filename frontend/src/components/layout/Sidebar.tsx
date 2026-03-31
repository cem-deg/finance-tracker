"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS, APP_NAME } from "@/utils/constants";
import {
  LayoutDashboard, Wallet, BarChart3, Lightbulb, Tags,
  LogOut, TrendingUp,
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

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <TrendingUp size={18} />
        </div>
        <h1>{APP_NAME}</h1>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              {iconMap[item.icon]}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initial}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || "User"}</div>
            <div className="user-email">{user?.email || ""}</div>
          </div>
          <button
            className="btn-ghost btn-icon"
            onClick={logout}
            title="Log out"
            id="logout-btn"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
