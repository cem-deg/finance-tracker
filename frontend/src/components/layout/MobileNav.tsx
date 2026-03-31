"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/utils/constants";
import {
  LayoutDashboard, Wallet, BarChart3, Lightbulb, Tags,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "layout-dashboard": <LayoutDashboard size={20} />,
  wallet: <Wallet size={20} />,
  "bar-chart-3": <BarChart3 size={20} />,
  lightbulb: <Lightbulb size={20} />,
  tags: <Tags size={20} />,
};

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" id="mobile-nav">
      <div className="mobile-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${isActive ? "active" : ""}`}
            >
              <div className="nav-icon-wrap">{iconMap[item.icon]}</div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
