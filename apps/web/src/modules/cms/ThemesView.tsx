"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import type {
  Gallery,
  GalleryStatus,
  ViewMode,
  SortKey,
} from "./gallery/gallery.types";
import { THEMES_DATA } from "./themes/themes.data";
import {
  loadCustomThemes,
  deleteCustomTheme,
  updateCustomTheme,
  loadThemeNodes,
} from "./themes/theme-store";
import { ThemeEditModal } from "./themes/ThemeEditModal";
import { TEMPLATES } from "@/components/editor/TemplatePicker";
import { useEditorStore } from "@/store/editorStore";
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
  const { toasts, addToast, dismiss } = useToaster();

  // Confirm-before-delete state
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Edit modal state
  const [editingTheme, setEditingTheme] = useState<Gallery | null>(null);

  useEffect(() => {
    const custom = loadCustomThemes();
    if (custom.length > 0) setThemes([...custom, ...THEMES_DATA]);
  }, []);

  const handleEditRequest = (id: string) => {
    const theme = themes.find((t) => t.id === id) ?? null;
    setEditingTheme(theme);
    setActiveDropdownId(null);
  };

  const handleSaveEdit = (id: string, patch: Partial<Gallery>) => {
    updateCustomTheme(id, patch);
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
    addToast("Theme updated successfully.", "success");
  };

  // Called by ThemeCard/ThemeTable — opens the confirm dialog
  const handleDeleteRequest = (id: string, title: string) => {
    setActiveDropdownId(null);
    setPendingDelete({ id, title });
  };

  // Called when user clicks "Delete" inside the dialog
  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteCustomTheme(pendingDelete.id); // persist removal from localStorage
    setThemes((prev) => prev.filter((t) => t.id !== pendingDelete.id));
    addToast(`"${pendingDelete.title}" has been removed.`, "info");
    setPendingDelete(null);
  };

  const handleToggleStatus = (id: string, current: GalleryStatus) => {
    const next: GalleryStatus = current === "published" ? "draft" : "published";
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: next } : t)),
    );
    addToast(`Theme marked as ${next}.`, "info");
    setActiveDropdownId(null);
  };

  const handleNavigate = (id: string) => {
    const { setPendingNodes } = useEditorStore.getState();

    // ── Custom (uploaded) theme ───────────────────────────────────────────────
    // Custom theme IDs are prefixed "theme-" (set in UploadView handlePublish).
    if (id.startsWith("theme-")) {
      const customNodes = loadThemeNodes(id);
      if (customNodes && customNodes.length > 0) {
        setPendingNodes(customNodes);
        router.push("/cms/editor");
      } else {
        // Nodes weren't saved — theme was published before editor-support was added.
        // Ask the user to re-upload so nodes are captured this time.
        addToast(
          "Re-upload this theme's ZIP to enable editing in the Editor.",
          "info",
        );
      }
      return;
    }

    // ── Built-in template ─────────────────────────────────────────────────────
    const template = TEMPLATES.find((t) => t.id === id);
    if (template) {
      setPendingNodes(template.buildNodes());
      router.push("/cms/editor");
      return;
    }

    // Fallback — open editor normally
    router.push("/cms/editor");
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
      <Toaster toasts={toasts} onDismiss={dismiss} />

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
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer group transform active:scale-[0.98] shrink-0"
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
            onDelete={handleDeleteRequest}
            onResetFilters={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            onNavigate={handleNavigate}
            onEdit={handleEditRequest}
          />
        ) : (
          <ThemeTable
            key="table"
            themes={processedThemes}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteRequest}
            onNavigate={handleNavigate}
            onEdit={handleEditRequest}
          />
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <ThemeEditModal
        theme={editingTheme}
        onClose={() => setEditingTheme(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this theme?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-foreground">
                {pendingDelete.title}
              </span>{" "}
              will be permanently removed from the Themes Hub. This action
              cannot be undone.
            </>
          ) : undefined
        }
        confirmLabel="Yes, Delete Theme"
        cancelLabel="Keep It"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
