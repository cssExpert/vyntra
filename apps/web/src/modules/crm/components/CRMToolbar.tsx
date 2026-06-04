"use client";

import { Search, LayoutGrid, List, Settings2, SlidersHorizontal, Copy, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortDropdown, type SortOption } from "./shared/SortDropdown";
import { ExportDropdown } from "./shared/ExportDropdown";
import type { CRMViewMode } from "../types";

interface CRMToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: CRMViewMode;
  onViewChange: (mode: CRMViewMode) => void;
  activeSort: string;
  onSortChange: (opt: SortOption) => void;
}

export function CRMToolbar({
  search, onSearchChange, viewMode, onViewChange, activeSort, onSortChange,
}: CRMToolbarProps) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-border bg-background pl-9 pr-9 py-2.5 text-sm",
            "text-foreground placeholder:text-muted-foreground/50",
            "outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "transition-[border-color,box-shadow] duration-200",
          )}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex items-center rounded-xl border border-border bg-muted/40 p-0.5 gap-0.5">
        <button
          onClick={() => onViewChange("board")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer",
            viewMode === "board" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Board</span>
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer",
            viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>

      <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
        <Settings2 className="h-4 w-4" />
      </button>

      <div className="h-6 w-px bg-border" />

      <button className="flex items-center gap-1.5 rounded-xl border border-border bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition-colors cursor-pointer">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </button>

      {/* Sort — real dropdown */}
      <SortDropdown activeSort={activeSort} onSortChange={onSortChange} />

      {/* Export — real dropdown */}
      <ExportDropdown />

      <button className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button className="hidden lg:flex h-9 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer gap-1.5">
        <Save className="h-3.5 w-3.5" />
        Save
      </button>
    </div>
  );
}
