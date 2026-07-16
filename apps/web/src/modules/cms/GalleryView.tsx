"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect, useCallback } from "react";
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
import { galleries as galleriesApi, tags as tagsApi } from "@/lib/api";
import { GalleryStats } from "./gallery/GalleryStats";
import { GalleryControls } from "./gallery/GalleryControls";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryTable } from "./gallery/GalleryTable";
import { GalleryCreateModal } from "./gallery/GalleryCreateModal";
import type { CmsGallerySaveDto } from "@/lib/api";

export function GalleryView() {
  const t = useTranslations("cms.gallery");
  const router = useRouter();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const { toasts, addToast, dismiss } = useToaster();

  useEffect(() => {
    setIsLoading(true);
    galleriesApi
      .list()
      .then(setGalleries)
      .catch(() => addToast("Failed to load galleries.", "error"))
      .finally(() => setIsLoading(false));
    tagsApi
      .list()
      .then((all) => setAvailableTags(all.map((tag) => tag.name)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTagCreate = async (name: string) => {
    try {
      await tagsApi.findOrCreate(name);
      setAvailableTags((prev) => (prev.includes(name) ? prev : [...prev, name].sort((a, b) => a.localeCompare(b))));
    } catch {
      /* tag still gets added to the gallery even if catalog sync fails */
    }
  };

  const handleCreate = async (dto: CmsGallerySaveDto) => {
    const gallery = await galleriesApi.create(dto);
    setGalleries((prev) => [gallery, ...prev]);
    addToast(`"${gallery.title}" created successfully!`);
  };

  const handleDelete = (id: string, title: string) => {
    setActiveDropdownId(null);
    galleriesApi
      .delete(id)
      .then(() => {
        setGalleries((prev) => prev.filter((g) => g.id !== id));
        addToast(`"${title}" deleted.`, "info");
      })
      .catch(() => addToast("Failed to delete gallery.", "error"));
  };

  const handleToggleStatus = useCallback(
    (id: string, current: GalleryStatus) => {
      const next: GalleryStatus = current === "published" ? "draft" : "published";
      setActiveDropdownId(null);
      galleriesApi
        .update(id, { status: next })
        .then(() => {
          setGalleries((prev) => prev.map((g) => (g.id === id ? { ...g, status: next } : g)));
          addToast(`Gallery marked as ${next}.`, "info");
        })
        .catch(() => addToast("Failed to update gallery status.", "error"));
    },
    [addToast],
  );

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
          title={t("gallerieshub", { defaultValue: "Galleries Hub" })}
          paragraph="Build and design multi-format creative showcases. Organize curated assets, adjust status controls, and analyze live viewer interactions."
          width="100%"
          className="max-w-full"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-brand-600 transition-all duration-200 cursor-pointer group transform active:scale-[0.98] shrink-0"
        >
          <Plus
            size={16}
            className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
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
        {isLoading ? (
          <div className="py-24 text-center text-sm text-muted-foreground">Loading galleries…</div>
        ) : viewMode === "grid" ? (
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
        availableTags={availableTags}
        onTagCreate={handleTagCreate}
      />
    </div>
  );
}
