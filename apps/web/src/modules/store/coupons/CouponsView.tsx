"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Plus, Search, Tag, Pencil, Trash2, Copy } from "lucide-react";
import { SAMPLE_COUPONS } from "../store.data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCouponDiscount, pageWindow } from "../store.utils";

export function CouponsView() {
  const t = useTranslations("store.coupons");
  const router = useRouter();
  const isLoaded = usePageLoad(600);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    // Merge saved edits from localStorage with SAMPLE_COUPONS
    const savedEdits = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("store_coupons_edited") || "{}" : "{}");
    let r = SAMPLE_COUPONS.map((c) => savedEdits[c.id] || c);
    if (status) r = r.filter((c) => c.status === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.code.toLowerCase().includes(q));
    }
    return r;
  }, [search, status]);

  useEffect(() => {
    setPageIndex(0);
  }, [search, status]);

  const filteredCount = filtered.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = Math.ceil(filteredCount / pageSize) || 1;
  const paginatedRows = filtered.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );

  const totalUsed = SAMPLE_COUPONS.reduce((s, c) => s + c.usageCount, 0);

  const selectCls =
    "rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer";

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
            description={`${SAMPLE_COUPONS.length} ${t("title").toLowerCase()} · ${totalUsed} total uses`}
            breadcrumbs={[
              { label: t("store"), href: "/store" },
              { label: t("title") },
            ]}
          >
            <Button size="lg" radius="sm" className="px-4">
              <Plus
                size={16}
                className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
              />
              {t("addCoupon")}
            </Button>
          </PageHeader>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                key: "statusActive",
                value: SAMPLE_COUPONS.filter((c) => c.status === "active")
                  .length,
                color: "text-success",
              },
              {
                key: "statusExpired",
                value: SAMPLE_COUPONS.filter((c) => c.status === "expired")
                  .length,
                color: "text-error",
              },
              { key: "totalUses", value: totalUsed, color: "text-info" },
            ].map((s) => (
              <div
                key={s.key}
                className="glass-card p-3 flex items-center gap-3"
              >
                <Tag size={15} className={s.color} />
                <div>
                  <p className={`text-lg font-extrabold ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t(s.key)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Search size={17} />
              </span>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coupon code…"
                size="xl"
                className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 330px)" }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[13px] font-semibold text-muted-foreground">
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">
                      Code
                    </th>
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">
                      Discount
                    </th>
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">
                      Min. Spend
                    </th>
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">
                      Usage
                    </th>
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">
                      Expires
                    </th>
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">
                      Status
                    </th>
                    <th className="sticky top-0 bg-muted border-b border-border py-4 px-4 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[14px]">
                  {paginatedRows.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="group hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-sm text-xs">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(coupon.code)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-primary">
                        {formatCouponDiscount(coupon)}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {coupon.minimumSpend ? `$${coupon.minimumSpend}` : "—"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground tabular-nums">
                            {coupon.usageCount}
                          </span>
                          {coupon.usageLimit && (
                            <span className="text-muted-foreground text-xs">
                              / {coupon.usageLimit}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {coupon.expiresAt ?? "Never"}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge
                          variant={
                            coupon.status === "active"
                              ? "success"
                              : coupon.status === "expired"
                                ? "error"
                                : "muted"
                          }
                          label={
                            coupon.status.charAt(0).toUpperCase() +
                            coupon.status.slice(1)
                          }
                          size="sm"
                          dot
                        />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <TableActionMenu
                          items={[
                            {
                              label: t("view"),
                              icon: <Tag size={14} />,
                              onClick: () => router.push(`/store/coupons/${coupon.id}`),
                            },
                            {
                              label: t("edit"),
                              icon: <Pencil size={14} />,
                              onClick: () => router.push(`/store/coupons/${coupon.id}/edit`),
                            },
                            {
                              label: t("duplicate"),
                              icon: <Copy size={14} />,
                              onClick: () => {},
                              separator: true,
                            },
                            {
                              label: t("delete"),
                              icon: <Trash2 size={14} />,
                              onClick: () => {},
                              variant: "danger",
                              separator: true,
                            },
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
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                  className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  Showing {fromEntry} to {toEntry} of {filteredCount} entries
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    radius="sm"
                    className="h-8 px-3 text-muted-foreground"
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    disabled={pageIndex === 0}
                  >
                    ← Previous
                  </Button>
                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`e-${idx}`}
                        className="w-8 text-center text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageIndex(p as number)}
                        className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                      >
                        {(p as number) + 1}
                      </button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    radius="sm"
                    className="h-8 px-3 text-muted-foreground"
                    onClick={() =>
                      setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                    }
                    disabled={pageIndex >= pageCount - 1}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
