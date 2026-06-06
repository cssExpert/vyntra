"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Search, Grid, List, X, Sliders, CheckCircle2, Eye, Tag, MoreVertical, Trash2, ExternalLink, Info } from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { cn } from "@/lib/utils";
import { cmsThemes, type DbTheme } from "@/lib/api";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import type { ViewMode, SortKey } from "./gallery/gallery.types";

// ── helpers ──────────────────────────────────────────────────────────────────

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
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "alphabetical", label: "A to Z" },
];

// ── Preview Modal ─────────────────────────────────────────────────────────────

function ThemePreviewModal({
  theme,
  isActive,
  onClose,
  onActivate,
  activating,
  livePreviewUrl,
}: {
  theme: DbTheme | null;
  isActive: boolean;
  onClose: () => void;
  onActivate: (id: string) => void;
  activating: boolean;
  livePreviewUrl: string | null;
}) {
  if (!theme) return null;
  const v = theme.variables;
  const swatches = [
    { label: "Primary", color: getVar(v, "--primary", "#3b82f6") },
    { label: "Secondary", color: getVar(v, "--secondary", "#64748b") },
    { label: "Accent", color: getVar(v, "--accent", "#0ea5e9") },
    { label: "Background", color: getVar(v, "--background", "#ffffff") },
    { label: "Foreground", color: getVar(v, "--foreground", "#0f172a") },
    { label: "Muted", color: getVar(v, "--muted", "#f1f5f9") },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Thumbnail */}
        {theme.thumbnail && (
          <div className="relative aspect-[16/7] overflow-hidden bg-muted">
            <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {isActive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                <CheckCircle2 className="w-3 h-3" /> Active
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">{theme.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{getCategory(theme.variables)} · {theme.isGlobal ? "Global" : "Custom"}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {theme.description && (
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{theme.description}</p>
          )}

          {/* Color palette */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Color Palette</p>
            <div className="flex gap-2 flex-wrap">
              {swatches.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: s.color }}
                    title={`${s.label}: ${s.color}`}
                  />
                  <span className="text-[9px] text-muted-foreground font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          {(getVar(v, "--font-heading") || getVar(v, "--font-body")) && (
            <div className="mb-5 p-3 rounded-xl bg-muted/40 border border-border space-y-1">
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

          {/* Tags */}
          {getTags(theme.variables).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {getTags(theme.variables).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {livePreviewUrl && (
              <a
                href={livePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Live Preview
              </a>
            )}
            <button
              onClick={() => onActivate(theme.id)}
              disabled={isActive || activating}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
              )}
            >
              {isActive ? "Currently Active" : activating ? "Activating…" : "Use This Theme"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Theme Card ────────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  onActivate,
  onPreview,
  onDelete,
  activating,
  livePreviewUrl,
}: {
  theme: DbTheme;
  isActive: boolean;
  onActivate: (id: string) => void;
  onPreview: (theme: DbTheme) => void;
  onDelete?: (id: string, name: string) => void;
  activating: boolean;
  livePreviewUrl: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const v = theme.variables;
  const category = getCategory(v);
  const tags = getTags(v);
  const primary = getVar(v, "--primary", "#3b82f6");
  const bg = getVar(v, "--background", "#ffffff");
  const fg = getVar(v, "--foreground", "#0f172a");

  return (
    <motion.div
      layout
      className={cn(
        "group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full",
        isActive
          ? "border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
          : "border-border hover:border-primary/30 hover:shadow-lg",
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {theme.thumbnail ? (
          <img
            src={theme.thumbnail}
            alt={theme.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          // CSS variable color preview when no thumbnail
          <div className="w-full h-full flex items-end p-3" style={{ backgroundColor: bg }}>
            <div className="flex gap-1.5">
              {[primary, getVar(v, "--secondary", "#64748b"), getVar(v, "--accent", "#0ea5e9")].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
            {category}
          </span>
          {isActive && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500 text-white">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          )}
        </div>

        {/* Color dot preview */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          {[primary, getVar(v, "--secondary", "#64748b"), getVar(v, "--accent", "#0ea5e9"), bg, fg].map((c, i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: c }} />
          ))}
        </div>

        {/* Live preview overlay */}
        {livePreviewUrl ? (
          <a
            href={livePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-md text-[10px] font-semibold px-2 py-1 rounded-md border border-border/60 text-foreground"
          >
            <ExternalLink className="w-3 h-3" /> Live Preview
          </a>
        ) : (
          <button
            onClick={() => onPreview(theme)}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-md text-[10px] font-semibold px-2 py-1 rounded-md border border-border/60 text-foreground"
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-bold text-foreground line-clamp-1">{theme.name}</h3>

            {/* Dropdown — only for custom themes */}
            {!theme.isGlobal && onDelete && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-lg p-1.5 z-20"
                      >
                        <button
                          onClick={() => { onDelete(theme.id, theme.name); setMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Theme
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {theme.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{theme.description}</p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/60">
                  <Tag className="w-2 h-2" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {livePreviewUrl ? (
              <a
                href={livePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ExternalLink className="w-3 h-3" /> Preview
              </a>
            ) : (
              <button
                onClick={() => onPreview(theme)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Preview
              </button>
            )}
            <button
              onClick={() => onPreview(theme)}
              title="Color details"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onActivate(theme.id)}
              disabled={isActive || activating}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
              )}
            >
              {isActive ? "Active" : activating ? "…" : "Use Theme"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Controls ──────────────────────────────────────────────────────────────────

function ThemeControls({
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  viewMode, setViewMode,
  selectedCategory, setSelectedCategory,
  categories,
}: {
  searchQuery: string; setSearchQuery: (v: string) => void;
  sortBy: SortKey; setSortBy: (v: SortKey) => void;
  viewMode: ViewMode; setViewMode: (v: ViewMode) => void;
  selectedCategory: string; setSelectedCategory: (v: string) => void;
  categories: string[];
}) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm md:max-w-md">
          <Search size={16} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, category, or tag…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-2.5 my-auto text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-background border border-border text-sm text-foreground py-2.5 px-3 rounded-lg outline-none focus:border-primary transition"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card">
            {([["grid", Grid], ["table", List]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn("relative p-2 rounded-lg transition-colors", viewMode === mode ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {viewMode === mode && (
                  <motion.div layoutId="theme-view-pill" className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                )}
                <Icon className="relative z-10 w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex-shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs font-semibold uppercase tracking-wider mr-2">
          <Sliders className="w-3.5 h-3.5" /> Filter:
        </div>
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all",
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
  );
}

// ── Table view ────────────────────────────────────────────────────────────────

function ThemeTableRow({
  theme, isActive, onActivate, onPreview, onDelete, activating, livePreviewUrl,
}: {
  theme: DbTheme; isActive: boolean;
  onActivate: (id: string) => void; onPreview: (t: DbTheme) => void;
  onDelete?: (id: string, name: string) => void; activating: boolean;
  livePreviewUrl: string | null;
}) {
  const v = theme.variables;
  const primary = getVar(v, "--primary", "#3b82f6");
  const secondary = getVar(v, "--secondary", "#64748b");
  const accent = getVar(v, "--accent", "#0ea5e9");
  const bg = getVar(v, "--background", "#ffffff");
  const fg = getVar(v, "--foreground", "#0f172a");

  return (
    <tr className={cn("border-b border-border transition-colors hover:bg-muted/30", isActive && "bg-emerald-500/5")}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {theme.thumbnail && (
            <img src={theme.thumbnail} alt={theme.name} className="w-12 h-8 rounded-md object-cover border border-border" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{theme.name}</span>
              {isActive && <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase">Active</span>}
            </div>
            <span className="text-xs text-muted-foreground">{getCategory(v)}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          {[primary, secondary, accent, bg, fg].map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: c }} title={c} />
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", theme.isGlobal ? "bg-blue-500/10 text-blue-600 border-blue-200" : "bg-purple-500/10 text-purple-600 border-purple-200")}>
          {theme.isGlobal ? "Global" : "Custom"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
        {new Date(theme.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {livePreviewUrl ? (
            <a
              href={livePreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-all"
            >
              <ExternalLink className="w-3 h-3" /> Preview
            </a>
          ) : (
            <button onClick={() => onPreview(theme)} className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-all">
              Preview
            </button>
          )}
          <button onClick={() => onPreview(theme)} title="Color details" className="p-1.5 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all">
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onActivate(theme.id)}
            disabled={isActive || activating}
            className={cn("text-xs px-2.5 py-1 rounded-lg font-semibold transition-all", isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-300 cursor-default" : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60")}
          >
            {isActive ? "Active" : "Use"}
          </button>
          {!theme.isGlobal && onDelete && (
            <button onClick={() => onDelete(theme.id, theme.name)} className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ThemesView() {
  const { previewUrl, ready: siteReady } = useSitePreviewUrl();

  function buildPreviewUrl(themeId: string): string | null {
    if (!siteReady) return null;
    const base = previewUrl(undefined);
    if (!base) return null;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}previewTheme=${encodeURIComponent(themeId)}`;
  }

  const [allThemes, setAllThemes] = useState<DbTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [previewTheme, setPreviewTheme] = useState<DbTheme | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const { toasts, addToast, dismiss } = useToaster();

  useEffect(() => {
    cmsThemes.list()
      .then((data) => {
        setActiveThemeId(data.activeThemeId);
        setAllThemes([...data.global, ...data.custom]);
      })
      .catch(() => addToast("Failed to load themes.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(allThemes.map((t) => getCategory(t.variables)));
    return [...set].sort();
  }, [allThemes]);

  const handleActivate = useCallback(async (id: string) => {
    setActivatingId(id);
    try {
      await cmsThemes.activate(id);
      setActiveThemeId(id);
      addToast("Theme activated successfully.", "success");
      setPreviewTheme(null);
    } catch {
      addToast("Failed to activate theme.", "error");
    } finally {
      setActivatingId(null);
    }
  }, [addToast]);

  const handleDeleteRequest = (id: string, name: string) => {
    setPendingDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await cmsThemes.deleteCustom(pendingDelete.id);
      setAllThemes((prev) => prev.filter((t) => t.id !== pendingDelete.id));
      if (activeThemeId === pendingDelete.id) setActiveThemeId(null);
      addToast(`"${pendingDelete.name}" deleted.`, "info");
    } catch {
      addToast("Failed to delete theme.", "error");
    } finally {
      setPendingDelete(null);
    }
  };

  const processedThemes = useMemo(() => {
    let result = [...allThemes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        getCategory(t.variables).toLowerCase().includes(q) ||
        getTags(t.variables).some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory !== "All") {
      result = result.filter((t) => getCategory(t.variables) === selectedCategory);
    }
    result.sort((a, b) => {
      if (sortBy === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sortBy === "alphabetical") return a.name.localeCompare(b.name);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return result;
  }, [allThemes, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="font-sans text-foreground pb-20">
      <Toaster toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <SectionTitle
          mb="0"
          title="Themes Hub"
          paragraph="Choose a theme to apply to your public site. Global themes are available to all, custom themes are yours only."
          width="100%"
          className="max-w-full"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[16/14]" />
          ))}
        </div>
      ) : (
        <>
          <ThemeControls
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            sortBy={sortBy} setSortBy={setSortBy}
            viewMode={viewMode} setViewMode={setViewMode}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            categories={categories}
          />

          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {processedThemes.length === 0 ? (
                  <div className="col-span-full text-center py-20 border-2 border-dashed border-border rounded-3xl">
                    <Palette className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-semibold text-foreground">No themes found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                    <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="mt-3 text-xs text-primary hover:underline">Reset filters</button>
                  </div>
                ) : processedThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === activeThemeId}
                    onActivate={handleActivate}
                    onPreview={setPreviewTheme}
                    onDelete={handleDeleteRequest}
                    activating={activatingId === theme.id}
                    livePreviewUrl={buildPreviewUrl(theme.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Theme</th>
                        <th className="px-4 py-3 text-left font-semibold">Colors</th>
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Added</th>
                        <th className="px-4 py-3 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedThemes.map((theme) => (
                        <ThemeTableRow
                          key={theme.id}
                          theme={theme}
                          isActive={theme.id === activeThemeId}
                          onActivate={handleActivate}
                          onPreview={setPreviewTheme}
                          onDelete={handleDeleteRequest}
                          activating={activatingId === theme.id}
                          livePreviewUrl={buildPreviewUrl(theme.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewTheme && (
          <ThemePreviewModal
            theme={previewTheme}
            isActive={previewTheme.id === activeThemeId}
            onClose={() => setPreviewTheme(null)}
            onActivate={handleActivate}
            activating={activatingId === previewTheme.id}
            livePreviewUrl={buildPreviewUrl(previewTheme.id)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this theme?"
        description={
          pendingDelete ? (
            <><span className="font-semibold text-foreground">{pendingDelete.name}</span> will be permanently removed. This cannot be undone.</>
          ) : undefined
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
