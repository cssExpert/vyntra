"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Palette,
  Search,
  Grid,
  List,
  X,
  CheckCircle2,
  ExternalLink,
  Code2,
} from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { cn } from "@/lib/utils";
import { cmsThemes, type DbTheme } from "@/lib/api";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import type { ViewMode } from "./gallery/gallery.types";
import { Input } from "@/components/ui/input";

// ── Theme Card ────────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  onActivate,
  activating,
  livePreviewUrl,
}: {
  theme: DbTheme;
  isActive: boolean;
  onActivate: (id: string) => void;
  activating: boolean;
  livePreviewUrl: string | null;
}) {
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.thumbnail}
            alt={theme.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            <Palette className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
            <Code2 className="w-3 h-3" /> {theme.identifier}
          </span>
          {isActive && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500 text-white">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          )}
        </div>

        {/* Live preview overlay */}
        {livePreviewUrl && (
          <a
            href={livePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-md text-[10px] font-semibold px-2 py-1 rounded-md border border-border/60 text-foreground"
          >
            <ExternalLink className="w-3 h-3" /> Live Preview
          </a>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">{theme.name}</h3>
          {theme.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {theme.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {livePreviewUrl && (
            <a
              href={livePreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ExternalLink className="w-3 h-3" /> Preview
            </a>
          )}
          <button
            onClick={() => onActivate(theme.id)}
            disabled={isActive || activating}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
              isActive
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary-600 disabled:opacity-60",
            )}
          >
            {isActive ? "Active" : activating ? "…" : "Use Theme"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────

function ThemeTableRow({
  theme,
  isActive,
  onActivate,
  activating,
  livePreviewUrl,
}: {
  theme: DbTheme;
  isActive: boolean;
  onActivate: (id: string) => void;
  activating: boolean;
  livePreviewUrl: string | null;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/30",
        isActive && "bg-emerald-500/5",
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {theme.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.thumbnail}
              alt={theme.name}
              className="w-12 h-8 rounded-md object-cover border border-border"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{theme.name}</span>
              {isActive && (
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase">
                  Active
                </span>
              )}
            </div>
            {theme.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {theme.description}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-xs font-mono bg-muted text-primary px-2 py-0.5 rounded border border-border/60 w-fit">
          <Code2 className="w-3 h-3" /> {theme.identifier}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
        {new Date(theme.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {livePreviewUrl && (
            <a
              href={livePreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-all"
            >
              <ExternalLink className="w-3 h-3" /> Preview
            </a>
          )}
          <button
            onClick={() => onActivate(theme.id)}
            disabled={isActive || activating}
            className={cn(
              "text-xs px-2.5 py-1 rounded-lg font-semibold transition-all",
              isActive
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-300 cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary-600 disabled:opacity-60",
            )}
          >
            {isActive ? "Active" : "Use"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ThemesView() {
  const t = useTranslations("cms.themes");
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
  const [pendingDeactivate, setPendingDeactivate] = useState(false);
  const { toasts, addToast, dismiss } = useToaster();

  useEffect(() => {
    cmsThemes
      .list()
      .then((data) => {
        setActiveThemeId(data.activeThemeId);
        setAllThemes(data.global);
      })
      .catch(() => addToast("Failed to load themes.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = useCallback(
    async (id: string) => {
      setActivatingId(id);
      try {
        await cmsThemes.activate(id);
        setActiveThemeId(id);
        addToast("Theme activated successfully.", "success");
      } catch {
        addToast("Failed to activate theme.", "error");
      } finally {
        setActivatingId(null);
      }
    },
    [addToast],
  );

  const handleDeactivate = async () => {
    try {
      await cmsThemes.deactivate();
      setActiveThemeId(null);
      addToast("Theme deactivated. Using platform default.", "info");
    } catch {
      addToast("Failed to deactivate theme.", "error");
    } finally {
      setPendingDeactivate(false);
    }
  };

  const processedThemes = useMemo(() => {
    let result = [...allThemes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q) ||
          t.identifier.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allThemes, searchQuery]);

  return (
    <div className="font-sans text-foreground pb-20">
      <Toaster toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <SectionTitle
          mb="0"
          title={t("themeshub", { defaultValue: "Themes" })}
          paragraph="Choose a theme to apply to your public site. Themes control the complete visual appearance of your pages."
          width="100%"
          className="max-w-full"
        />
        {activeThemeId && (
          <button
            onClick={() => setPendingDeactivate(true)}
            className="shrink-0 px-4 py-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted hover:text-foreground transition-all"
          >
            Reset to Default
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name or identifier…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="xl"
            className="w-full pl-9 pr-8 bg-background border border-border rounded-lg text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-2.5 my-auto text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card">
          {([["grid", Grid], ["table", List]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "relative p-2 rounded-lg transition-colors",
                viewMode === mode ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {viewMode === mode && (
                <motion.div
                  layoutId="theme-view-pill"
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon className="relative z-10 w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[16/14]" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {processedThemes.length === 0 ? (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-border rounded-3xl">
                  <Palette className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-semibold text-foreground">No themes found</p>
                  <button onClick={() => setSearchQuery("")} className="mt-3 text-xs text-primary hover:underline">
                    Clear search
                  </button>
                </div>
              ) : (
                processedThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === activeThemeId}
                    onActivate={handleActivate}
                    activating={activatingId === theme.id}
                    livePreviewUrl={buildPreviewUrl(theme.id)}
                  />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Theme</th>
                      <th className="px-4 py-3 text-left font-semibold">Identifier</th>
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
      )}

      <ConfirmDialog
        open={pendingDeactivate}
        title="Reset to default theme?"
        description="Your site will use the platform default appearance until you activate a theme again."
        confirmLabel="Yes, Reset"
        cancelLabel="Keep Current"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setPendingDeactivate(false)}
      />
    </div>
  );
}
