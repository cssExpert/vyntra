"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionTitle from "@/components/common/SectionTitle";
import type { Gallery, GalleryStatus, ViewMode, SortKey, Toast } from "./gallery/gallery.types";
import { INITIAL_GALLERIES } from "./gallery/gallery.data";
import { loadGalleries, saveGalleries } from "./gallery/gallery.store";
import { GalleryStats } from "./gallery/GalleryStats";
import { GalleryControls } from "./gallery/GalleryControls";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryTable } from "./gallery/GalleryTable";
import { GalleryCreateModal } from "./gallery/GalleryCreateModal";

export function GalleryView() {
  const router = useRouter();

  // Load from localStorage on first render, fall back to INITIAL_GALLERIES
  const [galleries, setGalleries] = useState<Gallery[]>(() => loadGalleries());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist to localStorage whenever galleries change
  useEffect(() => { saveGalleries(galleries); }, [galleries]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const handleCreate = (gallery: Gallery) => {
    setGalleries((prev) => [gallery, ...prev]);
    addToast(`"${gallery.title}" created successfully!`);
  };

  const handleDelete = (id: string, title: string) => {
    setGalleries((prev) => prev.filter((g) => g.id !== id));
    addToast(`"${title}" deleted.`, "info");
    setActiveDropdownId(null);
  };

  const handleToggleStatus = (id: string, current: GalleryStatus) => {
    const next: GalleryStatus = current === "published" ? "draft" : "published";
    setGalleries((prev) => prev.map((g) => g.id === id ? { ...g, status: next } : g));
    addToast(`Gallery marked as ${next}.`, "info");
    setActiveDropdownId(null);
  };

  const handleNavigate = (id: string) => {
    router.push(`/cms/gallery/${id}`);
  };

  const stats = useMemo(() => ({
    total: galleries.length,
    published: galleries.filter((g) => g.status === "published").length,
    drafts: galleries.filter((g) => g.status === "draft").length,
    totalViews: galleries.reduce((acc, g) => acc + g.views, 0),
    totalItems: galleries.reduce((acc, g) => acc + g.itemCount, 0),
  }), [galleries]);

  const processedGalleries = useMemo(() => {
    let result = [...galleries];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory !== "All") result = result.filter((g) => g.category === selectedCategory);
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest": return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "items": return b.itemCount - a.itemCount;
        case "views": return b.views - a.views;
        case "alphabetical": return a.title.localeCompare(b.title);
        default: return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
    return result;
  }, [galleries, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="font-sans text-foreground pb-20">
      {/* Toasts — matches UsersView exactly */}
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
                <span className={cn("w-2 h-2 rounded-full", toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-primary")} />
                <p>{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}
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
          title="Galleries Hub"
          paragraph="Build and design multi-format creative showcases. Organize curated assets, adjust status controls, and analyze live viewer interactions."
          width="100%"
          className="max-w-full"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer group transform active:scale-[0.98] shrink-0"
        >
          <Plus size={18} className="stroke-[3] transition-transform group-hover:rotate-90 duration-300" />
          <span>Add New Gallery</span>
        </button>
      </div>

      <GalleryStats stats={stats} />

      <GalleryControls
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        sortBy={sortBy} setSortBy={setSortBy}
        viewMode={viewMode} setViewMode={setViewMode}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
      />

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <GalleryGrid
            key="grid"
            galleries={processedGalleries}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onResetFilters={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            onNavigate={handleNavigate}
          />
        ) : (
          <GalleryTable
            key="table"
            galleries={processedGalleries}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <GalleryCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        onError={(msg) => addToast(msg, "error")}
      />
    </div>
  );
}
