"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type Column,
  type ColumnPinningState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { PIPELINE_STAGES } from "../data/contacts";
import type { CRMContact } from "../types";

const columnHelper = createColumnHelper<CRMContact>();

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatValue(v?: number) {
  if (!v) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  subscriber: { bg: "bg-slate-500/10", text: "text-slate-500" },
  lead: { bg: "bg-brand-500/10", text: "text-brand-500" },
  mql: { bg: "bg-purple-500/10", text: "text-purple-500" },
  sql: { bg: "bg-cyan-500/10", text: "text-cyan-500" },
  opportunity: { bg: "bg-warning/10", text: "text-warning" },
  customer: { bg: "bg-success/10", text: "text-success" },
};

const COLUMNS = [
  columnHelper.accessor("name", {
    header: "Name",
    size: 220,
    cell: ({ getValue }) => {
      const name = getValue();
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-bold text-white">
            {getInitials(name)}
          </div>
          <span className="font-semibold text-foreground truncate">{name}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    size: 220,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground truncate">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("company", {
    header: "Company",
    size: 170,
    cell: ({ getValue }) => (
      <span className="text-foreground truncate">{getValue() ?? "—"}</span>
    ),
  }),
  columnHelper.accessor("stage", {
    header: "Stage",
    size: 170,
    cell: ({ getValue }) => {
      const stage = getValue();
      const label = PIPELINE_STAGES.find((s) => s.id === stage)?.label ?? stage;
      const cls = STAGE_COLORS[stage] ?? {
        bg: "bg-muted",
        text: "text-muted-foreground",
      };
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cls.bg} ${cls.text}`}
        >
          {label}
        </span>
      );
    },
  }),
  columnHelper.accessor("owner", {
    header: "Owner",
    size: 150,
    cell: ({ getValue }) => {
      const owner = getValue();
      if (!owner)
        return (
          <span className="text-muted-foreground/40 text-xs">Unassigned</span>
        );
      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
            {getInitials(owner)}
          </div>
          <span className="text-sm text-foreground truncate">{owner}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("value", {
    header: "Value",
    size: 110,
    cell: ({ getValue }) => (
      <span className="font-semibold text-success tabular-nums">
        {formatValue(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("lastActivity", {
    header: "Last Activity",
    size: 200,
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs truncate">
        {getValue() ?? "—"}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums text-xs">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    size: 56,
    enableSorting: false,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <TableActionMenu
          key={c.id}
          items={[
            { label: "View", icon: <Eye size={14} />, onClick: () => {} },
            {
              label: "Send email",
              icon: <Mail size={14} />,
              onClick: () => {},
            },
            { label: "Edit", icon: <Pencil size={14} />, onClick: () => {} },
            {
              label: "Open link",
              icon: <ExternalLink size={14} />,
              onClick: () => {},
              separator: true,
            },
            {
              label: "Delete",
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

interface Props {
  contacts: CRMContact[];
}

export function ContactsTable({ contacts }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning] = useState<ColumnPinningState>({
    left: ["name"],
    right: ["actions"],
  });

  // ── Scroll-aware shadow for pinned columns ────────────────
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

  const getCommonPinningStyles = (
    column: Column<CRMContact>,
  ): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRight =
      isPinned === "right" && column.getIsFirstColumn("right");

    return {
      position: isPinned ? "sticky" : undefined,
      left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      zIndex: isPinned ? 2 : undefined,
      boxShadow:
        isLastLeft && canScrollLeft
          ? "4px 0 6px -2px rgba(0,0,0,0.08)"
          : isFirstRight && canScrollRight
            ? "-4px 0 6px -2px rgba(0,0,0,0.08)"
            : undefined,
      transition: "box-shadow 0.2s ease",
    };
  };

  const table = useReactTable({
    data: contacts,
    columns: COLUMNS,
    state: { sorting, columnPinning },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {contacts.length > 0 ? (
        <div
          ref={setScrollEl}
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          <table
            className="text-left border-collapse"
            style={{ tableLayout: "fixed", width: "100%", minWidth: "1200px" }}
          >
            {/* ── Head ─────────────────────────────────────── */}
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
                          // thead pinned cells need higher z so they sit above tbody pinned cells
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

            {/* ── Body ─────────────────────────────────────── */}
            <tbody className="divide-y divide-border text-[13px]">
              <AnimatePresence initial={false}>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      layoutId={`crm-row-${row.id}`}
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
                            className={`py-3.5 px-4 ${
                              isPinned
                                ? "transition-colors group-hover:bg-muted/40 bg-card"
                                : ""
                            }`}
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
                  ))
                ) : (
                  <tr key="no-results">
                    <td
                      colSpan={COLUMNS.length}
                      className="py-12 text-center text-muted-foreground bg-muted/10"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle
                          className="text-muted-foreground/40"
                          size={32}
                        />
                        <p className="font-semibold text-foreground">
                          No contacts found
                        </p>
                        <p className="text-xs">
                          Try adjusting your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">No contacts yet</p>
          <p className="text-sm">Add your first contact to get started.</p>
        </div>
      )}
    </div>
  );
}
