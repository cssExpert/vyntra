"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Search, Package, Pencil, AlertTriangle } from "lucide-react";
import { SAMPLE_INVENTORY } from "../store.data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageWindow } from "../store.utils";
import { STOCK_STATUS_BADGES } from "../store.constants";

export function InventoryView() {
  const t = useTranslations("store.inventory");
  const router = useRouter();
  const isLoaded = usePageLoad(600);
  const [search,      setSearch]      = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize,  setPageSize]  = useState(10);

  const filtered = useMemo(() => {
    let r = SAMPLE_INVENTORY;
    if (stockFilter) r = r.filter((i) => i.stockStatus === stockFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }
    return r;
  }, [search, stockFilter]);

  useEffect(() => { setPageIndex(0); }, [search, stockFilter]);

  const filteredCount = filtered.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = Math.ceil(filteredCount / pageSize) || 1;
  const paginatedRows = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const outOfStock = SAMPLE_INVENTORY.filter((i) => i.stockStatus === "out_of_stock").length;
  const lowStock   = SAMPLE_INVENTORY.filter((i) => i.stockStatus === "low_stock").length;

  const selectCls = "h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
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
            title={t("title")}
            description={t("description")}
            breadcrumbs={[{ label: t("store"), href: "/store" }, { label: t("title") }]}
          />

          {/* Alert banners */}
          {(outOfStock > 0 || lowStock > 0) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {outOfStock > 0 && (
                <div className="flex items-center gap-2 rounded-sm bg-error/10 border border-error/20 px-4 py-2.5">
                  <AlertTriangle size={14} className="text-error" />
                  <span className="text-xs font-semibold text-error">{outOfStock} {t("outOfStockAlert")}</span>
                </div>
              )}
              {lowStock > 0 && (
                <div className="flex items-center gap-2 rounded-sm bg-warning/10 border border-warning/20 px-4 py-2.5">
                  <AlertTriangle size={14} className="text-warning" />
                  <span className="text-xs font-semibold text-warning">{lowStock} {t("lowStockAlert")}</span>
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Search size={17} />
              </span>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                size="lg" className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
              />
            </div>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className={selectCls}>
              <option value="">{t("allStock")}</option>
              <option value="in_stock">{t("inStockTab")}</option>
              <option value="low_stock">{t("lowStockTab")}</option>
              <option value="out_of_stock">{t("outOfStockTab")}</option>
              <option value="backorder">{t("backorderTab")}</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[13px] font-semibold text-muted-foreground">
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("productSKUHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("typeHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("stockHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("thresholdHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("statusHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("backorderHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("lastUpdatedHeader")}</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[14px]">
                {paginatedRows.map((item) => {
                  const badge = STOCK_STATUS_BADGES[item.stockStatus as keyof typeof STOCK_STATUS_BADGES];
                  return (
                    <tr key={item.id} className="group hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                            {item.featuredImage ? (
                              <img src={item.featuredImage} alt="" className="h-8 w-8 object-cover" />
                            ) : (
                              <Package size={12} className="text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground truncate max-w-[160px]">{item.productName}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground capitalize">{item.type.replace("_", " ")}</td>
                      <td className="py-4 px-4">
                        <span className={`font-bold tabular-nums ${item.stockStatus === "out_of_stock" ? "text-error" : item.stockStatus === "low_stock" ? "text-warning" : "text-foreground"}`}>
                          {item.stock === 9999 ? "∞" : item.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground tabular-nums">{item.lowStockThreshold || "—"}</td>
                      <td className="py-4 px-4">
                        <StatusBadge variant={badge.variant} label={t(badge.label)} size="sm" dot />
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge variant={item.backorderEnabled ? "info" : "muted"} label={item.backorderEnabled ? t("enabled", { defaultValue: "Enabled" }) : t("disabled", { defaultValue: "Disabled" })} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">{item.lastUpdated}</td>
                      <td className="py-4 px-4 text-right">
                        <TableActionMenu
                          items={[
                            { label: t("view"), icon: <Package size={14} />, onClick: () => router.push(`/store/inventory/${item.id}`) },
                            { label: t("edit"), icon: <Pencil size={14} />, onClick: () => router.push(`/store/inventory/${item.id}`) },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{t("show", { defaultValue: "Show" })}</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }} className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer">
                  {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>{t("entries", { defaultValue: "entries" })}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{t("showing", { defaultValue: "Showing" })} {fromEntry} {t("to", { defaultValue: "to" })} {toEntry} {t("of", { defaultValue: "of" })} {filteredCount} {t("entries", { defaultValue: "entries" })}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>← {t("previous", { defaultValue: "Previous" })}</Button>
                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? <span key={`e-${idx}`} className="w-8 text-center text-muted-foreground">…</span> : (
                      <button key={p} onClick={() => setPageIndex(p as number)} className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{(p as number) + 1}</button>
                    )
                  )}
                  <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1}>{t("next", { defaultValue: "Next" })} →</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
