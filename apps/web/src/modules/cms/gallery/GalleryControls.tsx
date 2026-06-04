"use client";

import { motion } from "framer-motion";
import { Search, Grid, List, X, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode, SortKey } from "./gallery.types";
import { CATEGORIES } from "./gallery.data";

interface GalleryControlsProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: SortKey;
  setSortBy: (v: SortKey) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
}

export function GalleryControls({
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  viewMode, setViewMode,
  selectedCategory, setSelectedCategory,
}: GalleryControlsProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search + sort + view mode */}
      <div className="bg-card/50 border border-border p-4 rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, category, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-background border border-border text-xs text-foreground py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary hover:border-border/80 transition-colors cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="items">Asset Count</option>
              <option value="views">Total Views</option>
              <option value="alphabetical">A to Z</option>
            </select>
          </div>

          {/* Animated Grid/List toggle */}
          <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card">
            {([{ mode: "grid" as ViewMode, Icon: Grid }, { mode: "table" as ViewMode, Icon: List }]).map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={mode === "grid" ? "Grid View" : "Table View"}
                className={cn(
                  "relative p-2 rounded-lg transition-colors",
                  viewMode === mode ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="gallery-view-indicator"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="relative z-10 w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex-shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs font-semibold uppercase tracking-wider mr-2">
          <Sliders className="w-3.5 h-3.5 text-primary" /> Filter:
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all",
              selectedCategory === cat
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-card text-muted-foreground border-border hover:border-border/80 hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
