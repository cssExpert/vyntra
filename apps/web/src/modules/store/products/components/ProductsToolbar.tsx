"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductsToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  stockFilter: string;
  onStockFilterChange: (v: string) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const PRODUCT_TYPES = [
  { value: "", label: "All Types" },
  { value: "simple",       label: "Simple" },
  { value: "variable",     label: "Variable" },
  { value: "digital",      label: "Digital" },
  { value: "downloadable", label: "Downloadable" },
  { value: "service",      label: "Service" },
  { value: "subscription", label: "Subscription" },
  { value: "bundle",       label: "Bundle" },
  { value: "gift_card",    label: "Gift Card" },
];

const STOCK_FILTERS = [
  { value: "",             label: "All Stock" },
  { value: "in_stock",     label: "In Stock" },
  { value: "low_stock",    label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

const selectCls = "rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer";

export function ProductsToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  stockFilter,
  onStockFilterChange,
  selectedCount,
  onBulkDelete,
  onClearSelection,
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search */}
      <div className="relative w-full sm:w-72">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
          <Search size={17} />
        </span>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, SKU…"
          size="xl" className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Right: filters + bulk actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-sm bg-primary/10 border border-primary/20 px-3 py-1.5">
            <span className="text-xs font-semibold text-primary">{selectedCount} selected</span>
            <button onClick={onBulkDelete} className="text-xs text-error font-medium hover:underline cursor-pointer">Delete</button>
            <button onClick={onClearSelection} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={12} /></button>
          </div>
        )}
        <select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)} className={selectCls}>
          {PRODUCT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select value={stockFilter} onChange={(e) => onStockFilterChange(e.target.value)} className={selectCls}>
          {STOCK_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer">
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>
    </div>
  );
}
