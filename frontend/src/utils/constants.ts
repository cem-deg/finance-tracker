/**
 * Application constants.
 */

export const APP_NAME = "Datafle";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "layout-dashboard" },
  { label: "Expenses", href: "/expenses", icon: "wallet" },
  { label: "Analytics", href: "/analytics", icon: "bar-chart-3" },
  { label: "Insights", href: "/insights", icon: "lightbulb" },
  { label: "Categories", href: "/categories", icon: "tags" },
] as const;

export const CATEGORY_ICONS = [
  "utensils", "car", "shopping-bag", "gamepad-2", "receipt",
  "heart-pulse", "graduation-cap", "layers", "home", "plane",
  "music", "coffee", "gift", "briefcase", "smartphone",
  "book", "dumbbell", "palette", "scissors", "circle",
] as const;

export const CATEGORY_COLORS = [
  "#ff6b6b", "#feca57", "#a29bfe", "#fd79a8", "#00cec9",
  "#00b894", "#6c5ce7", "#636e72", "#e17055", "#74b9ff",
  "#55efc4", "#fab1a0", "#81ecec", "#dfe6e9", "#b2bec3",
] as const;
