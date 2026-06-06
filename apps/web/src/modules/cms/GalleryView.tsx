"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import { Toaster, useToaster } from "@/components/common/Toaster";
import type {
  Gallery,
  GalleryStatus,
  ViewMode,
  SortKey,
} from "./gallery/gallery.types";
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
  const { toasts, addToast, dismiss } = useToaster();

  // Persist to localStorage whenever galleries change
  useEffect(() => {
    saveGalleries(galleries);
  }, [galleries]);

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
    setGalleries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: next } : g)),
    );
    addToast(`Gallery marked as ${next}.`, "info");
    setActiveDropdownId(null);
  };

  const handleNavigate = (id: string) => {
    router.push(`/cms/gallery/${id}`);
  };

  const stats = useMemo(
    () => ({
      total: galleries.length,
      published: galleries.filter((g) => g.status === "published").length,
      drafts: galleries.filter((g) => g.status === "draft").length,
      totalViews: galleries.reduce((acc, g) => acc + g.views, 0),
      totalItems: galleries.reduce((acc, g) => acc + g.itemCount, 0),
    }),
    [galleries],
  );

  const processedGalleries = useMemo(() => {
    let result = [...galleries];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory !== "All")
      result = result.filter((g) => g.category === selectedCategory);
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
  }, [galleries, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="font-sans text-foreground pb-20">
      <Toaster toasts={toasts} onDismiss={dismiss} />

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
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer group transform active:scale-[0.98] shrink-0"
        >
          <Plus
            size={18}
            className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
          />
          <span>Add New Gallery</span>
        </button>
      </div>

      <GalleryStats stats={stats} />

      <GalleryControls
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
          <GalleryGrid
            key="grid"
            galleries={processedGalleries}
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
