"use client";

import { motion } from "framer-motion";
import { Search, Grid, List, X, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode, SortKey } from "../gallery/gallery.types";
import { THEME_CATEGORIES } from "./themes.data";

interface ThemeControlsProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: SortKey;
  setSortBy: (v: SortKey) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
}

export function ThemeControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
}: ThemeControlsProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
            <Search size={17} />
          </span>
          <input
            type="text"
            placeholder="Search by name, category, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-2 py-2.5 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-background border border-border text-sm text-foreground py-2.5 px-3 rounded-sm outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="items">Section Count</option>
              <option value="views">Total Views</option>
              <option value="alphabetical">A to Z</option>
            </select>
          </div>

          {/* Grid/List toggle */}
          <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card">
            {[
              { mode: "grid" as ViewMode, Icon: Grid, title: "Grid View" },
              { mode: "table" as ViewMode, Icon: List, title: "Table View" },
            ].map(({ mode, Icon, title }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={title}
                className={cn(
                  "relative p-2 rounded-lg transition-colors",
                  viewMode === mode
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="theme-view-indicator"
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex-shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs font-semibold uppercase tracking-wider mr-2">
          <Sliders className="w-3.5 h-3.5 text-accent" /> Filter:
        </div>
        {THEME_CATEGORIES.map((cat) => (
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
