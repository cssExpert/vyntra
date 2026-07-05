"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type Column,
  type ColumnPinningState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Search,
  X,
  Download,
  Users,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Star,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import type { StoreCustomer } from "../store.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatStorePrice,
  getInitials,
  pageWindow,
  getCommonPinningStyles,
  toStoreCustomer,
} from "../store.utils";
import { CUSTOMER_STATUS_BADGES } from "../store.constants";
import { storeCustomers } from "@/lib/api";

const columnHelper = createColumnHelper<StoreCustomer>();

const SEGMENT_BADGE: Record<
  string,
  {
    variant: "success" | "warning" | "error" | "info" | "muted" | "purple";
    label: string;
  }
> = {
  new: { variant: "info", label: "New" },
  regular: { variant: "muted", label: "Regular" },
  vip: { variant: "warning", label: "VIP" },
  at_risk: { variant: "error", label: "At Risk" },
  inactive: { variant: "muted", label: "Inactive" },
};

const getColumns = (t: any, router: any, setDeleteTarget: (c: StoreCustomer) => void) => [
  columnHelper.accessor("name", {
    header: () => t("customerHeader", { defaultValue: "Customer" }),
    size: 220,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white relative">
            {getInitials(c.name)}
            {c.isVip && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-warning flex items-center justify-center">
                <Star size={8} className="text-white fill-white" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-[13px] truncate">
              {c.name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {c.email}
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("totalOrders", {
    header: () => t("ordersHeader", { defaultValue: "Orders" }),
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-semibold text-foreground tabular-nums">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("totalSpent", {
    header: () => t("totalSpent", { defaultValue: "Total Spent" }),
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-bold text-success tabular-nums">
        {formatStorePrice(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("averageOrderValue", {
    header: () => t("aov", { defaultValue: "AOV" }),
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-xs text-foreground tabular-nums">
        {formatStorePrice(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("rewardPoints", {
    header: () => t("points", { defaultValue: "Points" }),
    size: 90,
    cell: ({ getValue }) => (
      <div className="flex items-center gap-1">
        <TrendingUp size={11} className="text-warning" />
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {getValue().toLocaleString()}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("storeCredit", {
    header: () => t("credit", { defaultValue: "Credit" }),
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue();
      return v > 0 ? (
        <span className="text-xs font-semibold text-info tabular-nums">
          {formatStorePrice(v)}
        </span>
      ) : (
        <span className="text-muted-foreground/40 text-xs">—</span>
      );
    },
  }),
  columnHelper.accessor("segment", {
    header: () => t("segment", { defaultValue: "Segment" }),
    size: 100,
    cell: ({ getValue }) => {
      const seg = getValue();
      if (!seg)
        return <span className="text-muted-foreground/40 text-xs">—</span>;
      const badge = SEGMENT_BADGE[seg];
      return (
        <StatusBadge variant={badge.variant} label={badge.label} size="sm" />
      );
    },
  }),
  columnHelper.accessor("lastOrderDate", {
    header: () => t("lastOrder", { defaultValue: "Last Order" }),
    size: 110,
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {getValue() ?? "—"}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    size: 56,
    enableSorting: false,
    header: "",
    cell: ({ row }) => (
      <TableActionMenu
        items={[
          {
            label: t("viewProfile", { defaultValue: "View Profile" }),
            icon: <Eye size={14} />,
            onClick: () => router.push(`/store/customers/${row.original.id}`),
          },
          {
            label: t("sendEmail", { defaultValue: "Send Email" }),
            icon: <Mail size={14} />,
            onClick: () => {},
          },
          {
            label: t("edit", { defaultValue: "Edit" }),
            icon: <Pencil size={14} />,
            onClick: () => router.push(`/store/customers/${row.original.id}?edit=1`),
          },
          {
            label: t("delete", { defaultValue: "Delete" }),
            icon: <Trash2 size={14} />,
            onClick: () => setDeleteTarget(row.original),
            variant: "danger",
            separator: true,
          },
        ]}
      />
    ),
  }),
];

function Inner() {
  const t = useTranslations("store.customers");
  const router = useRouter();
  const isLoaded = usePageLoad(700);
  const [customers, setCustomers] = useState<StoreCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnPinning] = useState<ColumnPinningState>({
    left: ["name"],
    right: ["actions"],
  });
  const [deleteTarget, setDeleteTarget] = useState<StoreCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeCustomers.list({ take: 500 });
      setCustomers(res.data.map(toStoreCustomer));
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await storeCustomers.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("deleteFailed", { defaultValue: "Failed to delete customer." }));
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    let r = customers;
    if (segment) r = r.filter((c) => c.segment === segment);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      );
    }
    return r;
  }, [customers, search, segment]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [search, segment]);

  const table = useReactTable({
    data: filtered,
    columns: getColumns(t, router, (c) => { setDeleteTarget(c); setDeleteError(null); }),
    state: { sorting, columnPinning, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = filtered.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.isVip).length;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("deleteTitle", { defaultValue: "Delete Customer" })}
        description={
          <>
            {deleteTarget
              ? t("deleteDescription", {
                  defaultValue: `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`,
                  name: deleteTarget.name,
                })
              : ""}
            {deleteError && <p className="mt-2 text-destructive">{deleteError}</p>}
          </>
        }
        confirmLabel={isDeleting ? t("deleting", { defaultValue: "Deleting…" }) : t("delete", { defaultValue: "Delete" })}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
      />

      {!isLoaded || isLoading ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="h-72 w-full rounded-xl bg-muted animate-pulse" />
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
            title={t("title", { defaultValue: "Customers" })}
            description={`${customers.length} ${t("totalCustomers", { defaultValue: "customers" }).toLowerCase()} · ${vipCount} ${t("vip")} · $${totalSpent.toFixed(0)} ${t("lifetimeValue", { defaultValue: "lifetime value" }).toLowerCase()}`}
            breadcrumbs={[
              { label: t("store", { defaultValue: "Store" }), href: "/store" },
              { label: t("title", { defaultValue: "Customers" }) },
            ]}
          >
            <button className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              {t("export", { defaultValue: "Export" })}
            </button>
          </PageHeader>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: t("totalCustomers", { defaultValue: "Total" }),
                value: customers.length,
                color: "text-foreground",
              },
              { label: t("vip"), value: vipCount, color: "text-warning" },
              {
                label: t("new", { defaultValue: "New" }),
                value: customers.filter((c) => c.segment === "new").length,
                color: "text-info",
              },
              {
                label: t("atRisk", { defaultValue: "At Risk" }),
                value: customers.filter((c) => c.segment === "at_risk").length,
                color: "text-error",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card p-3 flex items-center gap-3"
              >
                <Users size={16} className={s.color} />
                <div>
                  <p className={`text-lg font-extrabold ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
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
                placeholder={t("searchPlaceholder", {
                  defaultValue: "Search customers…",
                })}
                size="lg"
                className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer"
            >
              <option value="">
                {t("allSegments", { defaultValue: "All Segments" })}
              </option>
              <option value="new">{t("new", { defaultValue: "New" })}</option>
              <option value="regular">
                {t("regular", { defaultValue: "Regular" })}
              </option>
              <option value="vip">{t("vip", { defaultValue: "VIP" })}</option>
              <option value="at_risk">
                {t("atRisk", { defaultValue: "At Risk" })}
              </option>
              <option value="inactive">
                {t("inactive", { defaultValue: "Inactive" })}
              </option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 340px)" }}
            >
              <table
                className="text-left border-collapse"
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  minWidth: "1100px",
                }}
              >
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr
                      key={hg.id}
                      className="text-[13px] font-semibold text-muted-foreground select-none"
                    >
                      {hg.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const isActions = header.id === "actions";
                        return (
                          <th
                            key={header.id}
                            onClick={
                              canSort
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            className={[
                              "sticky top-0 bg-muted border-b border-border font-semibold py-4 px-4",
                              isActions ? "text-right" : "",
                              canSort
                                ? "cursor-pointer hover:text-foreground transition-colors"
                                : "",
                            ].join(" ")}
                            style={getCommonPinningStyles(header.column)}
                          >
                            <div
                              className={`flex items-center gap-1 ${isActions ? "justify-end" : ""}`}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                              {canSort &&
                                (sorted === "asc" ? (
                                  <ChevronUp
                                    size={13}
                                    className="text-primary shrink-0"
                                  />
                                ) : sorted === "desc" ? (
                                  <ChevronDown
                                    size={13}
                                    className="text-primary shrink-0"
                                  />
                                ) : (
                                  <ChevronsUpDown
                                    size={13}
                                    className="text-muted-foreground/40 shrink-0"
                                  />
                                ))}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border text-[14px]">
                  <AnimatePresence initial={false}>
                    {table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-muted/40 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`py-4 px-4 ${cell.column.getIsPinned() ? "transition-colors group-hover:bg-muted/40 bg-card" : ""}`}
                            style={getCommonPinningStyles(cell.column)}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{t("show", { defaultValue: "Show" })}</span>
                <select
                  value={pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span>{t("entries", { defaultValue: "entries" })}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {t("showing", { defaultValue: "Showing" })} {fromEntry}{" "}
                  {t("to", { defaultValue: "to" })} {toEntry}{" "}
                  {t("of", { defaultValue: "of" })} {filteredCount}{" "}
                  {t("entries", { defaultValue: "entries" })}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    radius="sm"
                    className="h-8 px-3 text-muted-foreground"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    ← {t("previous", { defaultValue: "Previous" })}
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
                        onClick={() => table.setPageIndex(p)}
                        className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                      >
                        {p + 1}
                      </button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    radius="sm"
                    className="h-8 px-3 text-muted-foreground"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    {t("next", { defaultValue: "Next" })} →
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

export function CustomersView() {
  return <Inner />;
}
