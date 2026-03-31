/**
 * API client — single source of truth for all backend communication.
 * Follows DRY principle: all fetch logic centralized here.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("datafle_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiError(error.detail || "Request failed", response.status);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// ─── Auth ───────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request("/api/auth/me"),
};

// ─── Categories ─────────────────────────────────────────────
export const categoryApi = {
  getAll: () => request("/api/categories/"),

  create: (data: { name: string; icon?: string; color?: string }) =>
    request("/api/categories/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: { name?: string; icon?: string; color?: string }) =>
    request(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) =>
    request(`/api/categories/${id}`, { method: "DELETE" }),
};

// ─── Expenses ───────────────────────────────────────────────
export const expenseApi = {
  getAll: (params?: Record<string, string | number>) => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return request(`/api/expenses/${query}`);
  },

  getRecent: (limit = 5) => request(`/api/expenses/recent?limit=${limit}`),

  getById: (id: number) => request(`/api/expenses/${id}`),

  create: (data: {
    amount: number;
    description: string;
    category_id: number;
    expense_date: string;
  }) => request("/api/expenses/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Record<string, unknown>) =>
    request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) =>
    request(`/api/expenses/${id}`, { method: "DELETE" }),
};

// ─── Analytics ──────────────────────────────────────────────
export const analyticsApi = {
  getSummary: () => request("/api/analytics/summary"),

  getMonthly: (months = 12) =>
    request(`/api/analytics/monthly?months=${months}`),

  getCategoryDistribution: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    const query = params.toString();
    return request(`/api/analytics/category-distribution${query ? `?${query}` : ""}`);
  },

  getTrends: (days = 30) => request(`/api/analytics/trends?days=${days}`),

  getPrediction: () => request("/api/analytics/prediction"),

  getCategoryPredictions: () => request("/api/analytics/prediction/categories"),
};

// ─── Insights ───────────────────────────────────────────────
export const insightsApi = {
  get: (mode: "rule" | "ai" = "rule") =>
    request(`/api/insights/?mode=${mode}`),
};

export { ApiError };
