"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Plus, AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionTitle from "@/components/common/SectionTitle";
import type { Gallery, GalleryStatus, ViewMode, SortKey, Toast } from "./gallery/gallery.types";
import { INITIAL_GALLERIES } from "./gallery/gallery.data";
import { GalleryStats } from "./gallery/GalleryStats";
import { GalleryControls } from "./gallery/GalleryControls";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryTable } from "./gallery/GalleryTable";
import { GalleryCreateModal } from "./gallery/GalleryCreateModal";

export function GalleryView() {
  const [galleries, setGalleries] = useState<Gallery[]>(INITIAL_GALLERIES);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

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
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-4 rounded-xl shadow-glass-lg backdrop-blur-md flex items-center justify-between gap-3 pointer-events-auto border",
                toast.type === "error"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : toast.type === "info"
                    ? "bg-card border-border text-foreground"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
              )}
            >
              <div className="flex items-center gap-3">
                {toast.type === "error" ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                ) : toast.type === "info" ? (
                  <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))} className="hover:bg-foreground/10 p-1 rounded-lg transition-colors">
                <X className="w-4 h-4 opacity-60 hover:opacity-100" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <SectionTitle
          mb="0"
          title="Galleries Hub"
          paragraph="Build and design multi-format creative showcases. Organize curated assets, adjust status controls, and analyze live viewer interactions."
          width="100%"
          className="max-w-full"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-glow-brand transition-all text-sm shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add New Gallery
        </motion.button>
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
