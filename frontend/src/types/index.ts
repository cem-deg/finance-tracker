/**
 * TypeScript type definitions for the Datafle application.
 */

// ─── User & Auth ────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

// ─── Category ───────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  icon?: string;
  color?: string;
}

// ─── Expense ────────────────────────────────────────────────
export interface Expense {
  id: number;
  amount: number;
  description: string;
  expense_date: string;
  category_id: number;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  amount: number;
  description: string;
  category_id: number;
  expense_date: string;
}

export interface ExpenseUpdate {
  amount?: number;
  description?: string;
  category_id?: number;
  expense_date?: string;
}

export interface ExpenseList {
  items: Expense[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Analytics ──────────────────────────────────────────────
export interface DashboardSummary {
  total_this_month: number;
  total_last_month: number;
  month_change_percent: number;
  total_transactions: number;
  avg_per_transaction: number;
  top_category_id: number | null;
  highest_expense: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
}

export interface CategoryDistribution {
  category_id: number;
  amount: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  total: number;
}

export interface Prediction {
  prediction: number | null;
  confidence: string;
  r_squared?: number;
  trend?: string;
  slope?: number;
  data_points: number;
  message: string;
}

// ─── Insights ───────────────────────────────────────────────
export interface InsightResponse {
  mode: string;
  provider: string;
  insight: string;
}
