"use client";

import { motion } from "framer-motion";
import { Plus, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductsHeaderProps {
  total: number;
  onAdd: () => void;
}

const PRODUCT_TABS = [
  { id: "all", label: "All Products" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
] as const;

export type ProductTabId = (typeof PRODUCT_TABS)[number]["id"];

interface Props extends ProductsHeaderProps {
  activeTab: ProductTabId;
  onTabChange: (t: ProductTabId) => void;
}

export function ProductsHeader({
  total,
  activeTab,
  onTabChange,
  onAdd,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 w-fit">
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-colors duration-150 text-primary-foreground",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="relative z-10">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="store-products-tab"
                className="absolute inset-0 rounded-lg bg-primary shadow-md"
              />
            )}
            {tab.id === "all" && (
              <span
                className={cn(
                  "relative top-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full text-[10px] font-bold bg-primary-foreground text-muted-foreground",
                  activeTab === tab.id
                    ? "bg-muted-foreground text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:text-foreground",
                )}
              >
                {total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer">
          <Upload size={16} />
          Import
        </button>
        <button className="flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer">
          <Download size={16} />
          Export
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus
            size={18}
            className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
          />
          Add Product
        </button>
      </div>
    </div>
  );
}
