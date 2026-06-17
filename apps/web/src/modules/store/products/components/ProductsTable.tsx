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
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Package,
  Star,
} from "lucide-react";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StoreProduct } from "../../store.types";
import { Button } from "@/components/ui/button";
import {
  formatStorePrice,
  pageWindow,
  getCommonPinningStyles,
} from "../../store.utils";
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_COLORS,
  PRODUCT_STATUS_BADGES,
  STOCK_STATUS_BADGES,
} from "../../store.constants";

const columnHelper = createColumnHelper<StoreProduct>();

// ─── Columns ──────────────────────────────────────────────────────────────────

const buildColumns = (
  selected: Set<string>,
  onToggle: (id: string) => void,
  onToggleAll: (ids: string[]) => void,
  allIds: string[],
  tx: (key: string) => string,
) => {
  return [
  columnHelper.display({
    id: "select",
    size: 44,
    enableSorting: false,
    header: () => (
      <input
        type="checkbox"
        checked={allIds.length > 0 && allIds.every((id) => selected.has(id))}
        onChange={() =>
          allIds.every((id) => selected.has(id))
            ? onToggleAll([])
            : onToggleAll(allIds)
        }
        className="rounded border-border cursor-pointer accent-primary"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={selected.has(row.original.id)}
        onChange={() => onToggle(row.original.id)}
        className="rounded border-border cursor-pointer accent-primary"
      />
    ),
  }),
  columnHelper.accessor("name", {
    header: tx("productHeader"),
    size: 260,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
            {p.featuredImage ? (
              <img
                src={p.featuredImage}
                alt={p.name}
                className="h-9 w-9 object-cover"
              />
            ) : (
              <Package size={14} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate text-[13px]">
              {p.name}
            </p>
            <p className="text-[11px] text-muted-foreground">{p.sku}</p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("type", {
    header: tx("typeHeader"),
    size: 110,
    cell: ({ getValue }) => {
      const t = getValue();
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${PRODUCT_TYPE_COLORS[t] ?? "bg-muted text-muted-foreground"}`}
        >
          {tx(PRODUCT_TYPE_LABELS[t] ?? "typeSimple")}
        </span>
      );
    },
  }),
  columnHelper.accessor("price", {
    header: tx("priceHeader"),
    size: 120,
    cell: ({ row }) => {
      const { price, compareAtPrice } = row.original;
      return (
        <div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatStorePrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="ml-1.5 text-[11px] text-muted-foreground line-through tabular-nums">
              {formatStorePrice(compareAtPrice)}
            </span>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("stockStatus", {
    header: tx("stockHeader"),
    size: 130,
    cell: ({ row }) => {
      const { stockStatus, stock, type } = row.original;
      const badge = STOCK_STATUS_BADGES[stockStatus];
      const isDigital =
        type === "digital" ||
        type === "downloadable" ||
        type === "subscription";
      if (isDigital)
        return <span className="text-xs text-muted-foreground">{tx("unlimited")}</span>;
      return (
        <div className="flex items-center gap-1.5">
          <StatusBadge variant={badge.variant} label={tx(badge.label)} size="sm" />
          <span className="text-[11px] text-muted-foreground tabular-nums">
            ({stock})
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: tx("statusHeader"),
    size: 110,
    cell: ({ getValue }) => {
      const s = getValue();
      const badge = PRODUCT_STATUS_BADGES[s];
      return (
        <StatusBadge variant={badge.variant} label={tx(badge.label)} size="sm" />
      );
    },
  }),
  columnHelper.accessor("rating", {
    header: tx("ratingHeader"),
    size: 100,
    cell: ({ row }) => {
      const { rating, reviewCount } = row.original;
      if (!rating)
        return <span className="text-muted-foreground/40 text-xs">—</span>;
      return (
        <div className="flex items-center gap-1">
          <Star size={11} className="text-warning fill-warning" />
          <span className="text-xs font-semibold text-foreground">
            {rating}
          </span>
          <span className="text-[11px] text-muted-foreground">
            ({reviewCount})
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("totalSales", {
    header: tx("salesHeader"),
    size: 80,
    cell: ({ getValue }) => (
      <span className="text-xs font-semibold text-success tabular-nums">
        {(getValue() ?? 0).toLocaleString()}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    size: 56,
    enableSorting: false,
    header: "",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <TableActionMenu
          items={[
            { label: tx("view"), icon: <Eye size={14} />, onClick: () => {} },
            { label: tx("edit"), icon: <Pencil size={14} />, onClick: () => {} },
            {
              label: tx("duplicate"),
              icon: <Copy size={14} />,
              onClick: () => {},
              separator: true,
            },
            {
              label: tx("delete"),
              icon: <Trash2 size={14} />,
              onClick: () => {},
              variant: "danger",
              separator: true,
            },
          ]}
        />
      );
    },
  }),
  ];
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  products: StoreProduct[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
}

export function ProductsTable({
  products,
  selectedIds,
  onToggleSelect,
  onToggleAll,
}: Props) {
  const tx = useTranslations("store.products");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnPinning] = useState<ColumnPinningState>({
    left: ["select", "name"],
    right: ["actions"],
  });
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!scrollEl) return;
    const update = () => {
      setCanScrollLeft(scrollEl.scrollLeft > 0);
      setCanScrollRight(
        scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1,
      );
    };
    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    return () => {
      scrollEl.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollEl]);


  const columns = buildColumns(
    selectedIds,
    onToggleSelect,
    onToggleAll,
    products.map((p) => p.id),
    tx,
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnPinning, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = products.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();

  return (
    <div className="mb-6 bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
      {products.length > 0 ? (
        <>
        <div
          ref={setScrollEl}
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <table
            className="text-left border-collapse"
            style={{ tableLayout: "fixed", width: "100%", minWidth: "1100px" }}
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
                    const isPinned = header.column.getIsPinned();
                    return (
                      <th
                        key={header.id}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={[
                          "sticky top-0 bg-muted border-b border-border font-semibold",
                          isActions ? "py-4 px-4 text-right" : "py-4 px-4",
                          canSort
                            ? "cursor-pointer hover:text-foreground transition-colors"
                            : "",
                          isPinned ? "z-20" : "z-10",
                        ].join(" ")}
                        style={{
                          ...getCommonPinningStyles(header.column),
                          width: header.getSize(),
                          zIndex: isPinned ? 30 : 10,
                        }}
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
                    layoutId={`product-row-${row.id}`}
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
                          style={{
                            ...getCommonPinningStyles(cell.column),
                            width: cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Table Footer ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{tx("show")}</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
            >
              {[10, 25, 50, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>{tx("entries")}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {tx("showingEntries", {
                from: fromEntry,
                to: toEntry,
                total: filteredCount,
              })}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ← {tx("previous")}
              </Button>
              {pageWindow(pageIndex, pageCount).map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="w-8 text-center text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => table.setPageIndex(p)}
                    className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${
                      pageIndex === p
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {(p as number) + 1}
                  </button>
                ),
              )}
              <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {tx("next")} →
              </Button>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <Package size={36} className="text-muted-foreground/30" />
            <p className="font-semibold text-foreground">{tx("noProducts")}</p>
            <p className="text-sm">{tx("adjustSearch")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
