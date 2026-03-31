"use client";

import { useState, FormEvent } from "react";
import AppShell from "@/components/layout/AppShell";
import { useCategories } from "@/hooks/useData";
import { categoryApi } from "@/services/api";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/utils/constants";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import {
  Utensils, Car, ShoppingBag, Gamepad2, Receipt,
  HeartPulse, GraduationCap, Layers, Home, Plane,
  Music, Coffee, Gift, Briefcase, Smartphone,
  BookOpen, Dumbbell, Palette, Scissors, Circle,
} from "lucide-react";

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  utensils: <Utensils size={18} />,
  car: <Car size={18} />,
  "shopping-bag": <ShoppingBag size={18} />,
  "gamepad-2": <Gamepad2 size={18} />,
  receipt: <Receipt size={18} />,
  "heart-pulse": <HeartPulse size={18} />,
  "graduation-cap": <GraduationCap size={18} />,
  layers: <Layers size={18} />,
  home: <Home size={18} />,
  plane: <Plane size={18} />,
  music: <Music size={18} />,
  coffee: <Coffee size={18} />,
  gift: <Gift size={18} />,
  briefcase: <Briefcase size={18} />,
  smartphone: <Smartphone size={18} />,
  book: <BookOpen size={18} />,
  dumbbell: <Dumbbell size={18} />,
  palette: <Palette size={18} />,
  scissors: <Scissors size={18} />,
  circle: <Circle size={18} />,
};

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("circle");
  const [formColor, setFormColor] = useState("#6c5ce7");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setFormName("");
    setFormIcon("circle");
    setFormColor("#6c5ce7");
    setFormError("");
    setEditId(null);
  }

  function openEdit(cat: { id: number; name: string; icon: string; color: string }) {
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setEditId(cat.id);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await categoryApi.update(editId, { name: formName, icon: formIcon, color: formColor });
      } else {
        await categoryApi.create({ name: formName, icon: formIcon, color: formColor });
      }
      setShowModal(false);
      resetForm();
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category? Categories with expenses cannot be deleted.")) return;
    try {
      await categoryApi.delete(id);
      refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <AppShell>
      <div className="page-header animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Categories</h1>
          <p>Organize your expenses with custom categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }} id="add-category-btn">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="category-grid animate-in animate-in-delay-1">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 68 }} />
          ))
        ) : categories.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            <div className="empty-icon">🏷️</div>
            <h3>No categories yet</h3>
            <p>Create categories to organize your expenses.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="category-item">
              <div className="category-color" style={{ background: cat.color }}>
                {ICON_COMPONENTS[cat.icon] || <Circle size={18} />}
              </div>
              <span className="category-name">{cat.name}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(cat)} title="Edit">
                  <Edit3 size={14} />
                </button>
                {!cat.is_default && (
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(cat.id)} title="Delete" style={{ color: "var(--accent-danger)" }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="modal-title">{editId ? "Edit Category" : "New Category"}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {formError && <div className="auth-error" style={{ marginBottom: 16 }}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">Name</label>
                <input id="cat-name" type="text" className="form-input" placeholder="e.g., Groceries" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {CATEGORY_COLORS.map((c) => (
                    <div
                      key={c}
                      className={`color-swatch ${formColor === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => setFormColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORY_ICONS.map((icon) => (
                    <div
                      key={icon}
                      onClick={() => setFormIcon(icon)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: formIcon === icon ? formColor : "var(--bg-elevated)",
                        color: formIcon === icon ? "white" : "var(--text-secondary)",
                        cursor: "pointer",
                        border: formIcon === icon ? `2px solid ${formColor}` : "2px solid transparent",
                        transition: "all 150ms ease",
                      }}
                    >
                      {ICON_COMPONENTS[icon] || <Circle size={18} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
