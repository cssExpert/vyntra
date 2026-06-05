"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Column,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnPinningState,
} from "@tanstack/react-table";
import {
  Globe,
  Lock,
  Trash2,
  Palette,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  PencilLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import type { Gallery, GalleryStatus } from "../gallery/gallery.types";

interface ThemeTableProps {
  themes: Gallery[];
  onToggleStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (id: string, title: string) => void;
  onNavigate: (id: string) => void;
  onEdit: (id: string) => void;
}

const columnHelper = createColumnHelper<Gallery>();

export function ThemeTable({
  themes,
  onToggleStatus,
  onDelete,
  onNavigate,
  onEdit,
}: ThemeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning] = useState<ColumnPinningState>({
    left: ["title"],
    right: ["actions"],
  });

  // Scroll-aware pinned-column shadow — same pattern as UsersView
  const [tableContainerEl, setTableContainerEl] = useState<HTMLDivElement | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  useEffect(() => {
    if (!scrollEl) return;
    const update = () => {
      setCanScrollLeft(scrollEl.scrollLeft > 0);
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

  const getCommonPinningStyles = (column: Column<Gallery>): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");
    return {
      position: isPinned ? "sticky" : undefined,
      left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      zIndex: isPinned ? 2 : undefined,
      boxShadow:
        isLastLeft && canScrollLeft
          ? "4px 0 6px -2px rgba(0,0,0,0.08)"
          : isFirstRight && canScrollLeft
            ? "-4px 0 6px -2px rgba(0,0,0,0.08)"
            : undefined,
      transition: "box-shadow 0.2s ease",
    };
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Theme Details",
        size: 280,
        cell: ({ row }) => {
          const theme = row.original;
          return (
            <div className="flex items-center gap-4">
              <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
                <img
                  src={theme.coverUrl}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <button
                  onClick={() => onNavigate(theme.id)}
                  className="text-sm font-bold text-foreground group-hover:text-primary transition-colors text-left truncate max-w-[160px] block"
                >
                  {theme.title}
                </button>
                <div className="text-xs text-muted-foreground font-medium max-w-[180px] truncate mt-0.5">
                  {theme.description}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("category", {
        header: "Category",
        size: 130,
        cell: ({ getValue }) => (
          <span className="inline-flex items-center justify-center bg-muted text-muted-foreground font-bold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("itemCount", {
        header: "Sections",
        size: 110,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground tabular-nums">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        size: 130,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground font-medium">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 120,
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span className={cn(
              "inline-flex items-center justify-center font-bold text-[11px] px-3 py-1 rounded-full",
              status === "published"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          );
        },
      }),
      columnHelper.accessor("views", {
        header: "Views",
        size: 110,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground font-medium tabular-nums">
            {getValue().toLocaleString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => {
          const theme = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                boundaryElement={tableContainerEl}
                items={[
                  {
                    label: "Edit",
                    icon: <PencilLine size={13} className="stroke-[2.5]" />,
                    onClick: () => onEdit(theme.id),
                  },
                  {
                    label: "Open in Editor",
                    icon: <ExternalLink size={13} />,
                    onClick: () => onNavigate(theme.id),
                  },
                  {
                    label: `Mark as ${theme.status === "published" ? "Draft" : "Published"}`,
                    icon: theme.status === "published"
                      ? <Lock size={13} />
                      : <Globe size={13} />,
                    onClick: () => onToggleStatus(theme.id, theme.status),
                  },
                  {
                    label: "Delete Theme",
                    icon: <Trash2 size={13} />,
                    onClick: () => onDelete(theme.id, theme.title),
                    variant: "danger",
                    separator: true,
                  },
                ]}
              />
            </div>
          );
        },
      }),
    ],
    [tableContainerEl, onEdit, onNavigate, onToggleStatus, onDelete],
  );

  const table = useReactTable({
    data: themes,
    columns,
    state: { sorting, columnPinning },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <motion.div
      ref={setTableContainerEl}
      key="table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      {themes.length > 0 ? (
        <div
          ref={setScrollEl}
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 380px)" }}
        >
          <table
            className="text-left border-collapse"
            style={{ tableLayout: "fixed", width: "100%", minWidth: "960px" }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="text-[13px] font-semibold text-muted-foreground select-none">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    const isActions = header.id === "actions";
                    const isTitle = header.id === "title";
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className={cn(
                          "sticky top-0 z-10 bg-muted border-b border-border font-semibold",
                          isActions ? "py-4 px-6 text-right" : isTitle ? "py-4 px-6" : "py-4 px-4",
                          canSort && "cursor-pointer hover:text-foreground transition-colors",
                        )}
                        style={{
                          ...getCommonPinningStyles(header.column),
                          width: header.getSize(),
                          ...(header.column.getIsPinned() ? { zIndex: 20 } : {}),
                        }}
                      >
                        <div className={cn("flex items-center gap-1", isActions && "justify-end")}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            sorted === "asc" ? <ChevronUp size={13} className="text-primary shrink-0" />
                            : sorted === "desc" ? <ChevronDown size={13} className="text-primary shrink-0" />
                            : <ChevronsUpDown size={13} className="text-muted-foreground/40 shrink-0" />
                          )}
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
                      layoutId={`theme-row-${row.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-muted/40 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const id = cell.column.id;
                        const isPinned = cell.column.getIsPinned();
                        const tdCls = cn(
                          id === "title" ? "py-4 px-6 font-bold text-foreground" : id === "actions" ? "py-4 px-6 text-right" : "py-4 px-4",
                          isPinned && "transition-colors group-hover:bg-muted/40 bg-card",
                        );
                        return (
                          <td
                            key={cell.id}
                            className={tdCls}
                            style={{
                              ...getCommonPinningStyles(cell.column),
                              width: cell.column.getSize(),
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))
                ) : (
                  <tr key="no-results">
                    <td colSpan={columns.length} className="py-12 text-center text-muted-foreground bg-muted/10">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Palette className="text-muted-foreground/40 w-8 h-8" />
                        <p className="font-semibold text-foreground">No themes found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search or category filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center">
          <Palette className="text-muted-foreground/30 w-10 h-10 mx-auto mb-3" />
          <p className="font-semibold text-foreground">No themes available</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first theme to get started.</p>
        </div>
      )}

      <div className="bg-muted/60 px-6 py-4 border-t border-border text-xs text-muted-foreground flex items-center justify-between font-medium">
        <span>Showing {table.getRowModel().rows.length} of {themes.length} {themes.length === 1 ? "theme" : "themes"}</span>
        <span>Theme Management Suite</span>
      </div>
    </motion.div>
  );
}
