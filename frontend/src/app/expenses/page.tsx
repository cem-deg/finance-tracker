"use client";

import { useState, FormEvent } from "react";
import AppShell from "@/components/layout/AppShell";
import { useExpenses, useCategories } from "@/hooks/useData";
import { expenseApi } from "@/services/api";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";
import { Plus, Trash2, Edit3, X, Search, Filter } from "lucide-react";

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const params: Record<string, string | number> = { page, per_page: 15 };
  if (categoryFilter) params.category_id = categoryFilter;

  const { data, loading, refetch } = useExpenses(params);
  const { categories } = useCategories();
  const { convertAndFormat } = useCurrency();
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Form state
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCatId, setFormCatId] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setFormAmount("");
    setFormDesc("");
    setFormCatId("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formAmount || !formDesc || !formCatId) {
      setFormError("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await expenseApi.update(editingId, {
          amount: parseFloat(formAmount),
          description: formDesc,
          category_id: parseInt(formCatId),
          expense_date: formDate,
        });
      } else {
        await expenseApi.create({
          amount: parseFloat(formAmount),
          description: formDesc,
          category_id: parseInt(formCatId),
          expense_date: formDate,
        });
      }
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this expense?")) return;
    try {
      await expenseApi.delete(id);
      refetch();
    } catch { /* silent */ }
  }

  function openEdit(exp: { id: number; amount: number; description: string; category_id: number; expense_date: string }) {
    setFormAmount(String(exp.amount));
    setFormDesc(exp.description);
    setFormCatId(String(exp.category_id));
    setFormDate(exp.expense_date);
    setEditingId(exp.id);
    setShowAddModal(true);
  }

  const filtered = data?.items.filter((e) =>
    !searchTerm || e.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <AppShell>
      <div className="page-header animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Expenses</h1>
          <p>Track and manage your spending</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }} id="add-expense-btn">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar animate-in animate-in-delay-1">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search-expenses"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} style={{ color: "var(--text-tertiary)" }} />
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            id="category-filter"
            style={{ minWidth: 160 }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="expense-list animate-in animate-in-delay-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No expenses found</h3>
            <p>Start tracking your spending by adding your first expense.</p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        ) : (
          filtered.map((exp) => {
            const cat = catMap.get(exp.category_id);
            return (
              <div key={exp.id} className="expense-item">
                <div className="category-dot" style={{ background: cat?.color || "#636e72" }} />
                <div className="expense-info">
                  <div className="expense-desc">{exp.description}</div>
                  <div className="expense-meta">{cat?.name || "Other"} · {formatDate(exp.expense_date)}</div>
                </div>
                <div className="expense-amount">-{convertAndFormat(exp.amount, exp.currency_code || "USD")}</div>
                <div className="expense-actions">
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(exp)} title="Edit">
                    <Edit3 size={15} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(exp.id)} title="Delete" style={{ color: "var(--accent-danger)" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
          {Array.from({ length: Math.min(data.total_pages, 7) }).map((_, i) => {
            const p = i + 1;
            return (
              <button key={p} className={`pagination-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>
                {p}
              </button>
            );
          })}
          <button className="pagination-btn" disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>→</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="modal-title">{editingId ? "Edit Expense" : "Add Expense"}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            {formError && <div className="auth-error" style={{ marginBottom: 16 }}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-amount">Amount ($)</label>
                  <input id="exp-amount" type="number" step="0.01" min="0" className="form-input" placeholder="0.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-date">Date</label>
                  <input id="exp-date" type="date" className="form-input" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="exp-desc">Description</label>
                <input id="exp-desc" type="text" className="form-input" placeholder="What did you spend on?" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="exp-category">Category</label>
                <select id="exp-category" className="form-select" value={formCatId} onChange={(e) => setFormCatId(e.target.value)} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Update" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
