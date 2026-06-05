"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Plus, Search, FolderOpen, Eye, Pencil, Trash2 } from "lucide-react";
import { SAMPLE_CATEGORIES } from "../store.data";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(0);
  if (current > 2) pages.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) add(i);
  if (current < total - 3) pages.push("…");
  add(total - 1);
  return pages;
}

export function CategoriesView() {
  const isLoaded = usePageLoad(600);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize,  setPageSize]  = useState(10);

  const filtered = SAMPLE_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => { setPageIndex(0); }, [search]);

  const filteredCount = filtered.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = Math.ceil(filteredCount / pageSize) || 1;
  const paginatedRows = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

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
            title="Categories"
            description="Organise your products with categories and subcategories."
            breadcrumbs={[{ label: "Store", href: "/store" }, { label: "Categories" }]}
          >
            <button className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer">
              <Plus size={18} className="stroke-[3] transition-transform group-hover:rotate-90 duration-300" />
              Add Category
            </button>
          </PageHeader>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
              <Search size={17} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
            />
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[13px] font-semibold text-muted-foreground">
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Category</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Slug</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Products</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Status</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Created</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[14px]">
                {paginatedRows.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 shrink-0 rounded-sm bg-primary/10 flex items-center justify-center">
                          <FolderOpen size={13} className="text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs font-mono">{cat.slug}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground">{cat.productCount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge variant={cat.status === "active" ? "success" : "muted"} label={cat.status === "active" ? "Active" : "Inactive"} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs">{cat.createdAt}</td>
                    <td className="py-4 px-4 text-right">
                      <TableActionMenu
                        items={[
                          { label: "View",   icon: <Eye size={14} />,    onClick: () => {} },
                          { label: "Edit",   icon: <Pencil size={14} />, onClick: () => {} },
                          { label: "Delete", icon: <Trash2 size={14} />, onClick: () => {}, variant: "danger", separator: true },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Show</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }} className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer">
                  {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Showing {fromEntry} to {toEntry} of {filteredCount} entries</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0} className="px-3 py-1.5 text-sm font-medium rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">← Previous</button>
                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? <span key={`e-${idx}`} className="w-8 text-center text-muted-foreground">…</span> : (
                      <button key={p} onClick={() => setPageIndex(p as number)} className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{(p as number) + 1}</button>
                    )
                  )}
                  <button onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1} className="px-3 py-1.5 text-sm font-medium rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">Next →</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
