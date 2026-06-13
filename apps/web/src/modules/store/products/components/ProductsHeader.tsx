"use client";

import { Plus, Download, Upload } from "lucide-react";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

export type ProductTabId = "all" | "active" | "draft" | "archived";

interface Props {
  total: number;
  activeTab: ProductTabId;
  onTabChange: (t: ProductTabId) => void;
  onAdd: () => void;
}

export function ProductsHeader({
  total,
  activeTab,
  onTabChange,
  onAdd,
}: Props) {
  const tabs: MotionTabItem<ProductTabId>[] = [
    { id: "all", label: "All Products", badge: total },
    { id: "active", label: "Active" },
    { id: "draft", label: "Draft" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <MotionTabs
        tabs={tabs}
        active={activeTab}
        onChange={onTabChange}
        layoutId="store-products-tab"
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer">
          <Upload size={16} />
          Import
        </button>
        <button className="flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer">
          <Download size={16} />
          Export
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer"
        >
          <Plus
            size={16}
            className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
          />
          Add Product
        </button>
      </div>
    </div>
  );
}
