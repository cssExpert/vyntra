"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnPinningState,
  type PaginationState,
  type Column,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Eye, Pencil, Printer, RefreshCw, Truck, Trash2, ShoppingCart,
} from "lucide-react";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StoreOrder } from "../../store.types";
import { Button } from "@/components/ui/button";

const columnHelper = createColumnHelper<StoreOrder>();

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const buildColumns = (
  tx: (key: string, values?: Record<string, string | number>) => string,
) => {
  const ORDER_STATUS_MAP: Record<string, { variant: "success" | "warning" | "info" | "error" | "muted" | "default"; label: string }> = {
    pending:    { variant: "warning",  label: tx("statusPending") },
    processing: { variant: "info",     label: tx("statusProcessing") },
    shipped:    { variant: "default",  label: tx("statusShipped") },
    delivered:  { variant: "success",  label: tx("statusDelivered") },
    cancelled:  { variant: "error",    label: tx("statusCancelled") },
    refunded:   { variant: "muted",    label: tx("statusRefunded") },
    on_hold:    { variant: "warning",  label: tx("statusOnHold") },
  };

  const PAY_STATUS_MAP: Record<string, { variant: "success" | "warning" | "error" | "muted" | "default"; label: string }> = {
    paid:     { variant: "success", label: tx("payPaid") },
    pending:  { variant: "warning", label: tx("payPending") },
    failed:   { variant: "error",   label: tx("payFailed") },
    refunded: { variant: "muted",   label: tx("payRefunded") },
    partial:  { variant: "warning", label: tx("payPartial") },
  };

  return [
  columnHelper.accessor("orderNumber", {
    header: tx("orderHeader"),
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("customerName", {
    header: tx("customerHeader"),
    size: 200,
    cell: ({ row }) => {
      const { customerName, customerEmail } = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
            {getInitials(customerName)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-[13px] truncate">{customerName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{customerEmail}</p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("items", {
    header: tx("itemsHeader"),
    size: 200,
    enableSorting: false,
    cell: ({ getValue }) => {
      const items = getValue();
      const first = items[0];
      const extra = items.length - 1;
      return (
        <div className="min-w-0">
          <p className="text-[13px] text-foreground truncate">{first.productName}</p>
          {extra > 0 && <p className="text-[11px] text-muted-foreground">{tx("moreItems", { count: extra })}</p>}
        </div>
      );
    },
  }),
  columnHelper.accessor("total", {
    header: tx("totalHeader"),
    size: 100,
    cell: ({ row }) => {
      const { total, discount } = row.original;
      return (
        <div>
          <span className="font-bold text-foreground tabular-nums">{formatCurrency(total)}</span>
          {discount > 0 && (
            <p className="text-[10px] text-success">{tx("discountOff", { amount: formatCurrency(discount) })}</p>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: tx("statusHeader"),
    size: 120,
    cell: ({ getValue }) => {
      const m = ORDER_STATUS_MAP[getValue()];
      return <StatusBadge variant={m.variant} label={m.label} size="sm" dot />;
    },
  }),
  columnHelper.accessor("paymentStatus", {
    header: tx("paymentHeader"),
    size: 110,
    cell: ({ getValue }) => {
      const m = PAY_STATUS_MAP[getValue()];
      return <StatusBadge variant={m.variant} label={m.label} size="sm" />;
    },
  }),
  columnHelper.accessor("createdAt", {
    header: tx("dateHeader"),
    size: 110,
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground tabular-nums">{getValue()}</span>
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
          { label: tx("view"),   icon: <Eye size={14} />,       onClick: () => {} },
          { label: tx("edit"),   icon: <Pencil size={14} />,    onClick: () => {} },
          { label: tx("print"),  icon: <Printer size={14} />,   onClick: () => {} },
          { label: tx("ship"),   icon: <Truck size={14} />,     onClick: () => {}, separator: true },
          { label: tx("refund"), icon: <RefreshCw size={14} />, onClick: () => {}, separator: true },
          { label: tx("delete"), icon: <Trash2 size={14} />,    onClick: () => {}, variant: "danger", separator: true },
        ]}
      />
    ),
  }),
  ];
};

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

interface Props {
  orders: StoreOrder[];
}

export function OrdersTable({ orders }: Props) {
  const tx = useTranslations("store.orders");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnPinning] = useState<ColumnPinningState>({ left: ["orderNumber"], right: ["actions"] });
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!scrollEl) return;
    const update = () => {
      setCanScrollLeft(scrollEl.scrollLeft > 0);
      setCanScrollRight(scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1);
    };
    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    return () => { scrollEl.removeEventListener("scroll", update); ro.disconnect(); };
  }, [scrollEl]);

  const getCommonPinningStyles = (column: Column<StoreOrder>): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeft  = isPinned === "left"  && column.getIsLastColumn("left");
    const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");
    return {
      position: isPinned ? "sticky" : undefined,
      left:  isPinned === "left"  ? `${column.getStart("left")}px`  : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      zIndex: isPinned ? 2 : undefined,
      boxShadow:
        isLastLeft && canScrollLeft   ? "4px 0 6px -2px rgba(0,0,0,0.08)" :
        isFirstRight && canScrollRight ? "-4px 0 6px -2px rgba(0,0,0,0.08)" : undefined,
      transition: "box-shadow 0.2s ease",
    };
  };

  const table = useReactTable({
    data: orders,
    columns: buildColumns(tx),
    state: { sorting, columnPinning, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = orders.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();

  return (
    <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
      {orders.length > 0 ? (
        <>
        <div ref={setScrollEl} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <table className="text-left border-collapse" style={{ tableLayout: "fixed", width: "100%", minWidth: "1100px" }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="text-[13px] font-semibold text-muted-foreground select-none">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted  = header.column.getIsSorted();
                    const isActions = header.id === "actions";
                    const isPinned  = header.column.getIsPinned();
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className={["sticky top-0 bg-muted border-b border-border font-semibold", isActions ? "py-4 px-4 text-right" : "py-4 px-4", canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""].join(" ")}
                        style={{ ...getCommonPinningStyles(header.column), width: header.getSize(), zIndex: isPinned ? 30 : 10 }}
                      >
                        <div className={`flex items-center gap-1 ${isActions ? "justify-end" : ""}`}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (sorted === "asc" ? <ChevronUp size={13} className="text-primary shrink-0" /> : sorted === "desc" ? <ChevronDown size={13} className="text-primary shrink-0" /> : <ChevronsUpDown size={13} className="text-muted-foreground/40 shrink-0" />)}
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
                    layoutId={`order-row-${row.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isPinned = cell.column.getIsPinned();
                      return (
                        <td
                          key={cell.id}
                          className={`py-4 px-4 ${isPinned ? "transition-colors group-hover:bg-muted/40 bg-card" : ""}`}
                          style={{ ...getCommonPinningStyles(cell.column), width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{tx("show")}</span>
              <select value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))} className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer">
                {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>{tx("entries")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{tx("showingEntries", { from: fromEntry, to: toEntry, total: filteredCount })}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>← {tx("previous")}</Button>
                {pageWindow(pageIndex, pageCount).map((p, idx) =>
                  p === "…" ? <span key={`e-${idx}`} className="w-8 text-center text-muted-foreground">…</span> : (
                    <button key={p} onClick={() => table.setPageIndex(p)} className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{(p as number) + 1}</button>
                  )
                )}
                <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{tx("next")} →</Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <ShoppingCart size={36} className="text-muted-foreground/30" />
            <p className="font-semibold text-foreground">{tx("noOrders")}</p>
            <p className="text-sm">{tx("adjustFilters")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
