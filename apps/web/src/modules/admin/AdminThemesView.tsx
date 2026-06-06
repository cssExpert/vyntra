"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Eye, Search, X, Tag,
  Globe, Palette, ChevronDown, ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { cn } from "@/lib/utils";
import { admin, type DbTheme } from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getVar(vars: Record<string, unknown>, key: string, fallback = "") {
  const v = vars[key];
  return typeof v === "string" ? v : fallback;
}

function getCategory(vars: Record<string, unknown>) {
  const v = vars["category"];
  return typeof v === "string" ? v : "Other";
}

function getTags(vars: Record<string, unknown>): string[] {
  const raw = vars["tags"];
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

const CSS_VAR_KEYS = [
  "--primary", "--primary-foreground",
  "--secondary", "--accent",
  "--background", "--foreground",
  "--muted", "--muted-foreground",
  "--card", "--border",
  "--radius",
  "--font-heading", "--font-body",
];

const CATEGORIES = ["Cosmetics", "Portfolio", "Business", "Agency", "Resume", "Other"];

// ── Color Swatch Row ──────────────────────────────────────────────────────────

function ColorDots({ vars }: { vars: Record<string, unknown> }) {
  const colors = [
    getVar(vars, "--primary", "#3b82f6"),
    getVar(vars, "--secondary", "#64748b"),
    getVar(vars, "--accent", "#0ea5e9"),
    getVar(vars, "--background", "#ffffff"),
    getVar(vars, "--foreground", "#0f172a"),
  ];
  return (
    <div className="flex gap-1">
      {colors.map((c, i) => (
        <div key={i} className="w-5 h-5 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
      ))}
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ theme, onClose }: { theme: DbTheme | null; onClose: () => void }) {
  if (!theme) return null;
  const v = theme.variables;
  const swatches = [
    { label: "Primary", key: "--primary" },
    { label: "Secondary", key: "--secondary" },
    { label: "Accent", key: "--accent" },
    { label: "Background", key: "--background" },
    { label: "Foreground", key: "--foreground" },
    { label: "Muted", key: "--muted" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {theme.thumbnail && (
          <div className="relative aspect-[16/7] overflow-hidden bg-muted">
            <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{theme.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{getCategory(v)} · Global</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {theme.description && <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Color Palette</p>
            <div className="flex gap-3 flex-wrap">
              {swatches.map((s) => (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl border border-border shadow-sm" style={{ backgroundColor: getVar(v, s.key, "#ccc") }} />
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/70">{getVar(v, s.key, "—")}</span>
                </div>
              ))}
            </div>
          </div>

          {(getVar(v, "--font-heading") || getVar(v, "--font-body")) && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
              {getVar(v, "--font-heading") && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Heading:</span>{" "}
                  {getVar(v, "--font-heading").split(",")[0].replace(/'/g, "")}
                </p>
              )}
              {getVar(v, "--font-body") && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Body:</span>{" "}
                  {getVar(v, "--font-body").split(",")[0].replace(/'/g, "")}
                </p>
              )}
            </div>
          )}

          {getTags(v).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {getTags(v).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Theme Form ────────────────────────────────────────────────────────────────

interface ThemeForm {
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string;
  variables: Record<string, string>;
}

const emptyForm = (): ThemeForm => ({
  name: "",
  description: "",
  thumbnail: "",
  category: "Business",
  tags: "",
  variables: Object.fromEntries(CSS_VAR_KEYS.map((k) => [k, ""])),
});

function themeToForm(t: DbTheme): ThemeForm {
  const v = t.variables as Record<string, string>;
  return {
    name: t.name,
    description: t.description ?? "",
    thumbnail: t.thumbnail ?? "",
    category: getCategory(t.variables),
    tags: getTags(t.variables).join(", "),
    variables: Object.fromEntries(CSS_VAR_KEYS.map((k) => [k, v[k] ?? ""])),
  };
}

function formToPayload(f: ThemeForm) {
  const tags = f.tags.split(",").map((s) => s.trim()).filter(Boolean);
  const variables: Record<string, unknown> = {
    ...Object.fromEntries(Object.entries(f.variables).filter(([, v]) => v.trim())),
    category: f.category,
    tags,
  };
  return {
    name: f.name.trim(),
    description: f.description.trim() || undefined,
    thumbnail: f.thumbnail.trim() || undefined,
    variables,
  };
}

function ThemeFormModal({
  open, title, form, onChange, onSave, onClose, busy,
}: {
  open: boolean; title: string;
  form: ThemeForm; onChange: (patch: Partial<ThemeForm>) => void;
  onSave: () => void; onClose: () => void; busy: boolean;
}) {
  const [showVars, setShowVars] = useState(false);

  const colorKeys = CSS_VAR_KEYS.filter((k) => k.startsWith("--") && !k.startsWith("--font") && k !== "--radius");
  const fontKeys = CSS_VAR_KEYS.filter((k) => k.startsWith("--font"));

  return (
    <Modal isOpen={open} onClose={onClose} title={title} maxWidth="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name *</label>
            <input className={adminInput} placeholder="e.g. Ocean Breeze" value={form.name} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select className={adminInput} value={form.category} onChange={(e) => onChange({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea className={cn(adminInput, "resize-none h-20")} placeholder="Short description of the theme style…" value={form.description} onChange={(e) => onChange({ description: e.target.value })} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Thumbnail URL</label>
          <input className={adminInput} placeholder="https://images.unsplash.com/…" value={form.thumbnail} onChange={(e) => onChange({ thumbnail: e.target.value })} />
          {form.thumbnail && (
            <img src={form.thumbnail} alt="preview" className="h-24 w-full object-cover rounded-xl border border-border mt-1" />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
          <input className={adminInput} placeholder="e.g. Dark, Bold, Minimal" value={form.tags} onChange={(e) => onChange({ tags: e.target.value })} />
        </div>

        {/* CSS Variables collapsible */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowVars((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
          >
            <span className="flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> CSS Variables</span>
            {showVars ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showVars && (
            <div className="p-4 space-y-4 border-t border-border">
              {/* Colors */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Colors</p>
                <div className="grid grid-cols-2 gap-3">
                  {colorKeys.map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground">{key}</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={form.variables[key] || "#000000"}
                          onChange={(e) => onChange({ variables: { ...form.variables, [key]: e.target.value } })}
                          className="h-8 w-8 rounded cursor-pointer border border-border"
                        />
                        <input
                          className={cn(adminInput, "flex-1 font-mono text-xs")}
                          placeholder="#3b82f6"
                          value={form.variables[key] || ""}
                          onChange={(e) => onChange({ variables: { ...form.variables, [key]: e.target.value } })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">--radius</label>
                <input className={cn(adminInput, "font-mono text-xs")} placeholder="0.5rem" value={form.variables["--radius"] || ""} onChange={(e) => onChange({ variables: { ...form.variables, "--radius": e.target.value } })} />
              </div>

              {/* Fonts */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Typography</p>
                <div className="space-y-3">
                  {fontKeys.map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground">{key}</label>
                      <input className={cn(adminInput, "font-mono text-xs")} placeholder="'Inter', system-ui, sans-serif" value={form.variables[key] || ""} onChange={(e) => onChange({ variables: { ...form.variables, [key]: e.target.value } })} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={busy || !form.name.trim()}
          className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save Theme"}
        </button>
      </div>
    </Modal>
  );
}

// ── Inner (guard-wrapped) ─────────────────────────────────────────────────────

function Inner() {
  const [themes, setThemes] = useState<DbTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTheme, setPreviewTheme] = useState<DbTheme | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DbTheme | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<DbTheme | null>(null);
  const [form, setForm] = useState<ThemeForm>(emptyForm());
  const [formBusy, setFormBusy] = useState(false);
  const { toasts, addToast, dismiss } = useToaster();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setThemes(await admin.listThemes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load themes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const set = new Set(themes.map((t) => getCategory(t.variables)));
    return [...set].sort();
  }, [themes]);

  const filtered = useMemo(() => {
    let r = [...themes];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        getCategory(t.variables).toLowerCase().includes(q) ||
        getTags(t.variables).some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory !== "All") r = r.filter((t) => getCategory(t.variables) === selectedCategory);
    return r;
  }, [themes, search, selectedCategory]);

  // ── Create ──
  const openCreate = () => {
    setForm(emptyForm());
    setEditTarget(null);
    setModalMode("create");
  };

  // ── Edit ──
  const openEdit = (t: DbTheme) => {
    setForm(themeToForm(t));
    setEditTarget(t);
    setModalMode("edit");
  };

  const handleSave = async () => {
    setFormBusy(true);
    try {
      const payload = formToPayload(form);
      if (modalMode === "create") {
        const created = await admin.createTheme(payload);
        setThemes((prev) => [created, ...prev]);
        addToast("Theme created.", "success");
      } else if (editTarget) {
        const updated = await admin.updateTheme(editTarget.id, payload);
        setThemes((prev) => prev.map((t) => (t.id === editTarget.id ? updated : t)));
        addToast("Theme updated.", "success");
      }
      setModalMode(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Save failed.", "error");
    } finally {
      setFormBusy(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await admin.deleteTheme(pendingDelete.id);
      setThemes((prev) => prev.filter((t) => t.id !== pendingDelete.id));
      addToast(`"${pendingDelete.name}" deleted.`, "info");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setDeleteLoading(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Toaster toasts={toasts} onDismiss={dismiss} />

      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Global Themes"
          description="Themes available to all organizations. Manage the platform's built-in theme library."
        />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> New Theme
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 px-5 py-3 bg-card border border-border rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{themes.length}</span>
          <span className="text-muted-foreground">global themes</span>
        </div>
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-medium text-foreground">{themes.filter((t) => getCategory(t.variables) === cat).length}</span>
            <span>{cat}</span>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search themes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute inset-y-0 right-2.5 my-auto text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
                selectedCategory === cat
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "bg-card text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[16/14]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Palette className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground">No themes found</p>
          <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="mt-2 text-xs text-primary hover:underline">Reset filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((theme) => (
            <motion.div
              key={theme.id}
              layout
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {theme.thumbnail ? (
                  <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-end p-3" style={{ backgroundColor: getVar(theme.variables, "--background", "#f8fafc") }}>
                    <ColorDots vars={theme.variables} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
                    {getCategory(theme.variables)}
                  </span>
                </div>

                <button
                  onClick={() => setPreviewTheme(theme)}
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-md text-[10px] font-semibold px-2 py-1 rounded-md border border-border/60 text-foreground"
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{theme.name}</h3>
                    {theme.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{theme.description}</p>
                    )}
                  </div>
                </div>

                <ColorDots vars={theme.variables} />

                {getTags(theme.variables).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getTags(theme.variables).slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[9px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setPreviewTheme(theme)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => openEdit(theme)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(theme)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewTheme && <PreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} />}
      </AnimatePresence>

      {/* Create / Edit modal */}
      <ThemeFormModal
        open={modalMode !== null}
        title={modalMode === "create" ? "Create Global Theme" : "Edit Theme"}
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSave={handleSave}
        onClose={() => setModalMode(null)}
        busy={formBusy}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this theme?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-foreground">{pendingDelete.name}</span> will be permanently removed for all organizations. This cannot be undone.
            </>
          ) : undefined
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function AdminThemesView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
