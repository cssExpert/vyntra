import { Clock, CheckCircle2, XCircle, Star, Eye, Check, X, Trash2, FileText, File, Package } from "lucide-react";
import { createColumnHelper, type FilterFn } from "@tanstack/react-table";

import { TableActionMenu } from "@/components/common/TableActionMenu";
import { type TableSkeletonColumn } from "@/components/common/TableSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import type { Comment, CommentStatus, CommentResourceType } from "./comments.types";

// Skeleton column layout mirrors the real table columns below.
export const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  { width: "flex-[1.6]", shape: "text", cellWidth: "w-40", headerWidth: "w-12" },
  { width: "flex-[1.4]", shape: "text", cellWidth: "w-32", headerWidth: "w-16" },
  { width: "flex-[2.6]", shape: "text", cellWidth: "w-56", headerWidth: "w-20" },
  { width: "flex-[1]", shape: "badge", cellWidth: "w-16", headerWidth: "w-12" },
  { width: "flex-[1.3]", shape: "text", cellWidth: "w-24", headerWidth: "w-14" },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

export function formatCommentDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [];
  const add = (n: number) => {
    if (!pages.includes(n)) pages.push(n);
  };
  add(0);
  if (current > 2) pages.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) add(i);
  if (current < total - 3) pages.push("…");
  add(total - 1);
  return pages;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CommentStatus, { cls: string; icon: React.ReactNode }> = {
  PENDING: {
    cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    icon: <Clock className="w-2.5 h-2.5" />,
  },
  APPROVED: {
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    icon: <CheckCircle2 className="w-2.5 h-2.5" />,
  },
  REJECTED: {
    cls: "bg-destructive/10 text-destructive border border-destructive/20",
    icon: <XCircle className="w-2.5 h-2.5" />,
  },
};

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  const { cls, icon } = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-md tracking-wider ${cls}`}>
      {icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Resource type badge ──────────────────────────────────────────────────────

const RESOURCE_CONFIG: Record<CommentResourceType, { label: string; icon: React.ReactNode }> = {
  blog: { label: "Blog", icon: <FileText className="w-2.5 h-2.5" /> },
  page: { label: "Page", icon: <File className="w-2.5 h-2.5" /> },
  product: { label: "Product", icon: <Package className="w-2.5 h-2.5" /> },
};

export function ResourceTypeBadge({ type }: { type: CommentResourceType }) {
  const { label, icon } = RESOURCE_CONFIG[type] ?? RESOURCE_CONFIG.blog;
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
      {icon}
      {label}
    </span>
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Comment>();

export const commentSearchFilter: FilterFn<Comment> = (row, _columnId, filterValue: string) => {
  const q = filterValue.toLowerCase();
  const r = row.original;
  return (
    (r.authorName ?? "").toLowerCase().includes(q) ||
    (r.authorEmail ?? "").toLowerCase().includes(q) ||
    r.body.toLowerCase().includes(q) ||
    (r.resourceTitle ?? "").toLowerCase().includes(q)
  );
};

interface ColumnHandlers {
  onView: (row: Comment) => void;
  onApprove: (row: Comment) => void;
  onReject: (row: Comment) => void;
  onDelete: (row: Comment) => void;
}

export function buildCommentColumns({ onView, onApprove, onReject, onDelete }: ColumnHandlers) {
  return [
    columnHelper.display({
      id: "select",
      size: 48,
      enableSorting: false,
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="cursor-pointer"
          />
        </div>
      ),
    }),

    columnHelper.accessor("authorName", {
      header: "From",
      size: 200,
      cell: ({ row, getValue }) => {
        const r = row.original;
        return (
          <button type="button" onClick={() => onView(r)} className="text-left min-w-0 block">
            <span className="font-semibold text-foreground truncate block max-w-[180px]">
              {getValue() || "Anonymous"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate block max-w-[180px]">
              {r.authorEmail || "—"}
            </span>
          </button>
        );
      },
    }),

    columnHelper.accessor("resourceType", {
      header: "On",
      size: 170,
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <div className="min-w-0 space-y-1">
          <ResourceTypeBadge type={getValue()} />
          {row.original.resourceTitle && (
            <span className="text-[12px] text-muted-foreground truncate block max-w-[150px]">
              {row.original.resourceTitle}
            </span>
          )}
        </div>
      ),
    }),

    columnHelper.accessor("body", {
      header: "Comment",
      size: 320,
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <div className="min-w-0">
          {row.original.rating != null && (
            <span className="inline-flex items-center gap-0.5 text-amber-500 mb-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="w-3 h-3" fill={i < row.original.rating! ? "currentColor" : "none"} />
              ))}
            </span>
          )}
          <span className="text-muted-foreground text-[13px] truncate block max-w-[280px]">{getValue()}</span>
        </div>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Status",
      size: 110,
      cell: ({ getValue }) => <CommentStatusBadge status={getValue()} />,
    }),

    columnHelper.accessor("createdAt", {
      header: "Received",
      size: 130,
      cell: ({ getValue }) => <span className="text-muted-foreground">{formatCommentDate(getValue())}</span>,
    }),

    columnHelper.display({
      id: "actions",
      header: "Action",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex justify-end">
            <TableActionMenu
              items={[
                { label: "View", icon: <Eye size={13} />, onClick: () => onView(r) },
                ...(r.status !== "APPROVED"
                  ? [{ label: "Approve", icon: <Check size={13} />, onClick: () => onApprove(r) }]
                  : []),
                ...(r.status !== "REJECTED"
                  ? [{ label: "Reject", icon: <X size={13} />, onClick: () => onReject(r) }]
                  : []),
                {
                  label: "Delete",
                  icon: <Trash2 size={13} />,
                  onClick: () => onDelete(r),
                  variant: "danger" as const,
                  separator: true,
                },
              ]}
            />
          </div>
        );
      },
    }),
  ];
}
