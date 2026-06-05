"use client";

import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import type { Gallery, GalleryStatus } from "../gallery/gallery.types";
import { ThemeCard } from "./ThemeCard";

interface ThemeGridProps {
  themes: Gallery[];
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onToggleStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (id: string, title: string) => void;
  onResetFilters: () => void;
  onNavigate: (id: string) => void;
}

export function ThemeGrid({
  themes,
  activeDropdownId,
  setActiveDropdownId,
  onToggleStatus,
  onDelete,
  onResetFilters,
  onNavigate,
}: ThemeGridProps) {
  if (themes.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-center py-20 border-2 border-dashed border-border rounded-3xl"
      >
        <div className="mx-auto w-16 h-16 bg-card rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
          <Palette className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No Themes Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          No themes matched your filters. Try adjusting your search or reset the
          filters.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 underline"
        >
          Reset Filters
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onNavigate={onNavigate}
        />
      ))}
    </motion.div>
  );
}
