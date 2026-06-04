"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import type { Gallery, GalleryStatus } from "./gallery.types";
import { GalleryCard } from "./GalleryCard";

interface GalleryGridProps {
  galleries: Gallery[];
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onToggleStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (id: string, title: string) => void;
  onResetFilters: () => void;
  onNavigate: (id: string) => void;
}

export function GalleryGrid({
  galleries, activeDropdownId, setActiveDropdownId,
  onToggleStatus, onDelete, onResetFilters, onNavigate,
}: GalleryGridProps) {
  if (galleries.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-center py-20 border-2 border-dashed border-border rounded-3xl"
      >
        <div className="mx-auto w-16 h-16 bg-card rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No Galleries Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          No galleries matched your filters. Try adjusting your search or create a new showcase.
        </p>
        <button onClick={onResetFilters} className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 underline">
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {galleries.map((gallery) => (
        <GalleryCard
          key={gallery.id}
          gallery={gallery}
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
