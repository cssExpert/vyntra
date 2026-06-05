"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductsHeader, type ProductTabId } from "./components/ProductsHeader";
import { ProductsToolbar } from "./components/ProductsToolbar";
import { ProductsTable } from "./components/ProductsTable";
import { SAMPLE_PRODUCTS } from "../store.data";

export function ProductsView() {
  const isLoaded = usePageLoad(700);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  const [activeTab,    setActiveTab]    = useState<ProductTabId>("all");
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [stockFilter,  setStockFilter]  = useState("");
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = SAMPLE_PRODUCTS;

    if (activeTab === "active")   result = result.filter((p) => p.status === "active");
    if (activeTab === "draft")    result = result.filter((p) => p.status === "draft");
    if (activeTab === "archived") result = result.filter((p) => p.status === "archived");

    if (typeFilter)  result = result.filter((p) => p.type === typeFilter);
    if (stockFilter) result = result.filter((p) => p.stockStatus === stockFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [activeTab, search, typeFilter, stockFilter]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleAll = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-4">
          <div className="h-9 w-96 rounded-sm bg-muted animate-pulse" />
          <div className="h-8 w-full rounded-sm bg-muted animate-pulse" />
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title="Products"
            description="Manage your entire product catalog."
            breadcrumbs={[{ label: "Store", href: "/store" }, { label: "Products" }]}
          />

          <ProductsHeader
            total={SAMPLE_PRODUCTS.length}
            activeTab={activeTab}
            onTabChange={(t) => { setActiveTab(t); setSelectedIds(new Set()); }}
            onAdd={() => { window.location.href = "/store/products/add"; }}
          />

          <ProductsToolbar
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            selectedCount={selectedIds.size}
            onBulkDelete={() => { setSelectedIds(new Set()); }}
            onClearSelection={() => setSelectedIds(new Set())}
          />

          <ProductsTable
            products={filtered}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
}
