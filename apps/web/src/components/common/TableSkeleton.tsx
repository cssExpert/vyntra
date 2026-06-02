"use client";

import React from "react";

// Base shimmer block — uses .shimmer from globals.css (theme-aware sweep).
function Sk({
  className = "",
  circle = false,
  rounded = "rounded-md",
}: {
  className?: string;
  circle?: boolean;
  rounded?: string;
}) {
  return (
    <div className={`shimmer ${circle ? "rounded-full" : rounded} ${className}`} />
  );
}

// The kind of placeholder rendered inside each body cell.
export type SkeletonShape =
  | "checkbox"
  | "text"
  | "badge"
  | "pill"
  | "avatar"
  | "actions";

export interface TableSkeletonColumn {
  /** Tailwind flex/width class controlling the column width, e.g. "flex-[2]" or "w-12". */
  width: string;
  /** What the placeholder inside the cell looks like. Defaults to "text". */
  shape?: SkeletonShape;
  /** Optional explicit width for the shimmer block (e.g. "w-24"). */
  cellWidth?: string;
  /** Optional width for the header shimmer (e.g. "w-10"). */
  headerWidth?: string;
  /** Align the cell content. Defaults to "start". */
  align?: "start" | "center" | "end";
}

export interface TableSkeletonProps {
  /** Column descriptors — usually mirrors the real table's columns. */
  columns: TableSkeletonColumn[];
  /** Number of placeholder body rows. Default 8. */
  rows?: number;
  /** Render the page header (title + action buttons + search). Default true. */
  showToolbar?: boolean;
  /** Render the pagination footer. Default true. */
  showFooter?: boolean;
}

function CellShape({ col }: { col: TableSkeletonColumn }) {
  const shape = col.shape ?? "text";
  switch (shape) {
    case "checkbox":
      return <Sk className="h-4 w-4" rounded="rounded-sm" />;
    case "avatar":
      return (
        <div className="flex items-center gap-2.5">
          <Sk className="h-8 w-8 shrink-0" circle />
          <Sk className={`h-3.5 ${col.cellWidth ?? "w-28"}`} />
        </div>
      );
    case "badge":
      return <Sk className={`h-5 ${col.cellWidth ?? "w-16"}`} rounded="rounded-md" />;
    case "pill":
      return <Sk className={`h-5 ${col.cellWidth ?? "w-20"}`} circle />;
    case "actions":
      return <Sk className="h-7 w-7" rounded="rounded-sm" />;
    case "text":
    default:
      return <Sk className={`h-3 ${col.cellWidth ?? "w-24"}`} />;
  }
}

const alignClass: Record<NonNullable<TableSkeletonColumn["align"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

/**
 * Reusable table content loader. Mirrors the table-card layout used across the
 * app (toolbar, card with header row, body rows, pagination footer). Pass the
 * same column shape as your real table so the skeleton lines up.
 */
export function TableSkeleton({
  columns,
  rows = 8,
  showToolbar = true,
  showFooter = true,
}: TableSkeletonProps) {
  return (
    <div>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Sk className="h-8 w-28 mb-2" />
            <Sk className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Sk className="h-10 w-28" rounded="rounded-sm" />
            <Sk className="h-10 w-24" rounded="rounded-sm" />
            <Sk className="h-10 w-32" rounded="rounded-sm" />
            <Sk className="h-10 w-52" rounded="rounded-sm" />
          </div>
        </div>
      )}

      {/* Table card */}
      <div
        className={`${showToolbar ? "mt-6" : ""} bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden`}
      >
        {/* Header row */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-border bg-muted/40">
          {columns.map((col, i) => (
            <div
              key={i}
              className={`${col.width} flex items-center ${alignClass[col.align ?? "start"]}`}
            >
              <Sk className={`h-3 ${col.headerWidth ?? "w-14"}`} />
            </div>
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0"
          >
            {columns.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`${col.width} flex items-center ${alignClass[col.align ?? "start"]}`}
              >
                <CellShape col={col} />
              </div>
            ))}
          </div>
        ))}

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-t border-border">
            <Sk className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Sk className="h-4 w-44" />
              <Sk className="h-8 w-20" rounded="rounded-sm" />
              <Sk className="h-8 w-8" rounded="rounded-sm" />
              <Sk className="h-8 w-16" rounded="rounded-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
