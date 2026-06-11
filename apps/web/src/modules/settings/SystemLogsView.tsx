"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  RefreshCw,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type FilterFn,
  type PaginationState,
} from "@tanstack/react-table";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  TableSkeleton,
  type TableSkeletonColumn,
} from "@/components/common/TableSkeleton";
import { apiGetActivity, type ApiActivityLog } from "@/lib/api";
import { Input } from "@/components/ui/input";

// Skeleton column layout mirrors the real table columns below.
const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  {
    width: "flex-[2.2]",
    shape: "text",
    cellWidth: "w-44",
    headerWidth: "w-14",
  },
  {
    width: "flex-[1.8]",
    shape: "text",
    cellWidth: "w-36",
    headerWidth: "w-12",
  },
  { width: "flex-[1]", shape: "badge", cellWidth: "w-12", headerWidth: "w-14" },
  {
    width: "flex-[1.2]",
    shape: "text",
    cellWidth: "w-20",
    headerWidth: "w-12",
  },
];

function statusVariant(
  code: number | null,
): "success" | "warning" | "error" | "muted" {
  if (code == null) return "muted";
  if (code < 300) return "success";
  if (code < 400) return "warning";
  return "error";
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [];
  const add = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  add(0);
  if (current > 2) pages.push("…");
  for (
    let i = Math.max(1, current - 1);
    i <= Math.min(total - 2, current + 1);
    i++
  )
    add(i);
  if (current < total - 3) pages.push("…");
  add(total - 1);
  return pages;
}

const columnHelper = createColumnHelper<ApiActivityLog>();

const logFilter: FilterFn<ApiActivityLog> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  const log = row.original;
  return (
    log.action.toLowerCase().includes(q) ||
    (log.resourceType?.toLowerCase().includes(q) ?? false) ||
    (log.user?.name?.toLowerCase().includes(q) ?? false) ||
    (log.user?.email.toLowerCase().includes(q) ?? false)
  );
};

const COLUMNS = [
  columnHelper.accessor("action", {
    header: "Action",
    size: 260,
    cell: ({ row, getValue }) => (
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{getValue()}</p>
        {row.original.resourceType && (
          <p className="text-xs text-muted-foreground truncate">
            {row.original.resourceType}
          </p>
        )}
      </div>
    ),
  }),
  columnHelper.accessor((log) => log.user?.name ?? log.user?.email ?? "", {
    id: "user",
    header: "User",
    size: 220,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="min-w-0">
          <p className="text-foreground truncate">{user.name ?? user.email}</p>
          {user.name && (
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("statusCode", {
    header: "Status",
    size: 110,
    cell: ({ getValue }) => (
      <StatusBadge
        variant={statusVariant(getValue())}
        label={getValue() != null ? String(getValue()) : "—"}
        size="sm"
      />
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "When",
    size: 150,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatWhen(getValue())}</span>
    ),
  }),
];

export function SystemLogsView() {
  const [logs, setLogs] = useState<ApiActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLogs(await apiGetActivity());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(() => COLUMNS, []);

  const table = useReactTable({
    data: logs,
    columns,
    state: { globalFilter: searchTerm, sorting, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: logFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="System Logs"
        description="Recent activity recorded for your organization."
      >
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <Search size={14} />
            </span>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs…"
              size="xl" className="pl-9 pr-8 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all w-48"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="lg"
            radius="sm"
            onClick={load}
            loading={loading}
            loadingText="Refreshing…"
            className="px-4 active:scale-[0.98]"
            startIcon={<RefreshCw size={15} />}
          >
            Refresh
          </Button>
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton columns={SKELETON_COLUMNS} rows={8} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            <table
              className="text-left border-collapse"
              style={{ tableLayout: "fixed", width: "100%", minWidth: "740px" }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-[13px] font-semibold text-muted-foreground select-none"
                  >
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          style={{ width: header.getSize() }}
                          className={`sticky top-0 z-10 bg-muted font-semibold py-4 px-4 border-b border-border ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                        >
                          <div className="flex items-center gap-1">
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
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="py-4 px-4"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                            <ScrollText className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {searchTerm
                                ? "No matching logs"
                                : "No activity recorded yet"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {searchTerm
                                ? "Try adjusting your search."
                                : "Activity will appear here as your team uses the platform."}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* ── Footer: entries selector + pagination ─────────────────── */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Show</span>
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
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 px-3 text-muted-foreground"
                >
                  ← Previous
                </Button>

                {pageWindow(pageIndex, pageCount).map((p, idx) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 text-center text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={pageIndex === p ? "default" : "outline"}
                      size="icon"
                      radius="sm"
                      onClick={() => table.setPageIndex(p)}
                      className={`w-8 h-8 text-sm font-semibold ${
                        pageIndex === p ? "" : "text-muted-foreground"
                      }`}
                    >
                      {p + 1}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  radius="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 px-3 text-muted-foreground"
                >
                  Next →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
