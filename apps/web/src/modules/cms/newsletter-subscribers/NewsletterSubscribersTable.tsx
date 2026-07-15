"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, Mail } from "lucide-react";
import { flexRender, type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { pageWindow } from "./newsletter-subscribers-table-config";
import type { NewsletterSubscriber } from "./newsletter-subscribers.types";

interface NewsletterSubscribersTableProps {
  table: Table<NewsletterSubscriber>;
  hasFiltersApplied: boolean;
}

export function NewsletterSubscribersTable({
  table,
  hasFiltersApplied,
}: NewsletterSubscribersTableProps) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();
  const columnsLength = table.getAllColumns().length;

  return (
    <div className="mt-4 bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <table
          className="text-left border-collapse"
          style={{ tableLayout: "fixed", width: "100%", minWidth: "780px" }}
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
                  const isActions = header.id === "actions";
                  const isSelect = header.id === "select";
                  return (
                    <th
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      style={{ width: header.getSize() }}
                      className={`sticky top-0 z-10 bg-muted font-semibold py-4 px-4 border-b border-border ${isActions ? "text-right" : ""} ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                    >
                      <div
                        className={`flex items-center gap-1 ${isActions ? "justify-end" : isSelect ? "justify-center" : ""}`}
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    layoutId={`subscriber-row-${row.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`hover:bg-muted/40 transition-colors ${row.getIsSelected() ? "bg-primary/5" : ""}`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const id = cell.column.id;
                      const tdCls =
                        id === "select"
                          ? "py-4 px-4"
                          : id === "actions"
                            ? "py-4 px-4 text-right"
                            : "py-4 px-4";
                      return (
                        <td
                          key={cell.id}
                          className={tdCls}
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columnsLength} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                        <Mail className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          No subscribers found
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {hasFiltersApplied
                            ? "Try adjusting your search."
                            : "Signups from your site's footer newsletter form will show up here."}
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

      {/* ── Footer: entries selector + pagination ─────────────────────────── */}
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
  );
}
