"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionTitle from "@/components/common/SectionTitle";
import type {
  Gallery,
  GalleryStatus,
  ViewMode,
  SortKey,
  Toast,
} from "./gallery/gallery.types";
import { THEMES_DATA } from "./themes/themes.data";
import { loadCustomThemes } from "./themes/theme-store";
import { ThemeStats } from "./themes/ThemeStats";
import { ThemeControls } from "./themes/ThemeControls";
import { ThemeGrid } from "./themes/ThemeGrid";
import { ThemeTable } from "./themes/ThemeTable";

export function ThemesView() {
  const router = useRouter();

  const [themes, setThemes] = useState<Gallery[]>(THEMES_DATA);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const custom = loadCustomThemes();
    if (custom.length > 0) setThemes([...custom, ...THEMES_DATA]);
  }, []);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleDelete = (id: string, title: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
    addToast(`"${title}" removed.`, "info");
    setActiveDropdownId(null);
  };

  const handleToggleStatus = (id: string, current: GalleryStatus) => {
    const next: GalleryStatus = current === "published" ? "draft" : "published";
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: next } : t)),
    );
    addToast(`Theme marked as ${next}.`, "info");
    setActiveDropdownId(null);
  };

  const handleNavigate = (_id: string) => {
    router.push(`/cms/editor`);
  };

  const stats = useMemo(
    () => ({
      total: themes.length,
      published: themes.filter((t) => t.status === "published").length,
      drafts: themes.filter((t) => t.status === "draft").length,
      totalViews: themes.reduce((acc, t) => acc + t.views, 0),
      totalItems: themes.reduce((acc, t) => acc + t.itemCount, 0),
    }),
    [themes],
  );

  const processedThemes = useMemo(() => {
    let result = [...themes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory !== "All")
      result = result.filter((t) => t.category === selectedCategory);
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "items":
          return b.itemCount - a.itemCount;
        case "views":
          return b.views - a.views;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
    return result;
  }, [themes, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="font-sans text-foreground pb-20">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 100 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={cn(
                "pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium",
                toast.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50"
                  : toast.type === "error"
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-800/50"
                    : "bg-primary/5 dark:bg-primary/10 text-primary border-primary/20 dark:border-primary/30",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    toast.type === "success"
                      ? "bg-emerald-500"
                      : toast.type === "error"
                        ? "bg-rose-500"
                        : "bg-primary",
                  )}
                />
                <p>{toast.message}</p>
              </div>
              <button
                onClick={() =>
                  setToasts((p) => p.filter((t) => t.id !== toast.id))
                }
                className="text-muted-foreground hover:text-foreground transition-colors ml-4"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <SectionTitle
          mb="0"
          title="Themes Hub"
          paragraph="A curated collection of modern, responsive, and professionally crafted website themes designed to accelerate your web projects with clean UI, seamless performance, and customizable layouts."
          width="100%"
          className="max-w-full"
        />
        <button
          onClick={() => router.push("/cms/themes/upload")}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer group transform active:scale-[0.98] shrink-0"
        >
          <Plus
            size={18}
            className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
          />
          <span>Add New Theme</span>
        </button>
      </div>

      {/* <ThemeStats stats={stats} /> */}

      <ThemeControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <ThemeGrid
            key="grid"
            themes={processedThemes}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onResetFilters={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            onNavigate={handleNavigate}
          />
        ) : (
          <ThemeTable
            key="table"
            themes={processedThemes}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
