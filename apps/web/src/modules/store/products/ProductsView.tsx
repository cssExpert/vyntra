"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductsHeader, type ProductTabId } from "./components/ProductsHeader";
import { ProductsToolbar } from "./components/ProductsToolbar";
import { ProductsTable } from "./components/ProductsTable";
import { storeProducts, type ApiProduct } from "@/lib/api";
import type { StoreProduct } from "../store.types";

function mapApiProduct(p: ApiProduct): StoreProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    type: p.type as StoreProduct["type"],
    status: p.status as StoreProduct["status"],
    shortDescription: p.shortDescription ?? undefined,
    description: p.description ?? undefined,
    specification: p.specification ?? undefined,
    featuredImage: p.featuredImage ?? undefined,
    media: p.media?.map((m) => ({ ...m, alt: m.alt ?? undefined })) ?? [],
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    costPrice: p.costPrice ?? undefined,
    taxClass: p.taxClass ?? undefined,
    stockStatus: p.stockStatus as StoreProduct["stockStatus"],
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    weight: p.weight ?? undefined,
    categoryIds: p.categoryIds ?? [],
    tags: p.tags ?? [],
    brand: p.brand ?? undefined,
    variants:
      p.variants?.map((v) => ({
        ...v,
        compareAtPrice: v.compareAtPrice ?? undefined,
        costPrice: v.costPrice ?? undefined,
        weight: v.weight ?? undefined,
        imageUrl: v.imageUrl ?? undefined,
        attributes: v.attributes ?? {},
      })) ?? [],
    seoTitle: p.seoTitle ?? undefined,
    seoDescription: p.seoDescription ?? undefined,
    publishedAt: p.publishedAt ?? undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    totalSales: p._count?.orderItems,
    reviewCount: p._count?.reviews,
  };
}

export function ProductsView() {
  const t = useTranslations("store.products");

  const [products,   setProducts]   = useState<StoreProduct[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<ProductTabId>("all");
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await storeProducts.list({ take: 500 });
      setProducts(res.data.map(mapApiProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = useMemo(() => {
    let result = [...products];

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
          p.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [products, activeTab, search, typeFilter, stockFilter]);

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

  const handleDelete = useCallback(async (id: string) => {
    try {
      await storeProducts.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }, []);

  if (isLoading) {
    return (
      <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="space-y-4">
        <div className="h-9 w-96 rounded-sm bg-muted animate-pulse" />
        <div className="h-8 w-full rounded-sm bg-muted animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-destructive text-sm">{error}</p>
        <button onClick={fetchProducts} className="text-sm text-primary underline">Retry</button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex flex-col gap-4"
      >
        <PageHeader
          title={t("title")}
          description={t("description")}
          breadcrumbs={[{ label: "Store", href: "/store" }, { label: t("title") }]}
        />

        <ProductsHeader
          total={products.length}
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setSelectedIds(new Set()); }}
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
          onDelete={handleDelete}
        />
      </motion.div>
    </AnimatePresence>
  );
}
