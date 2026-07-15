import { Mail, MailOpen, Eye, Trash2 } from "lucide-react";
import { createColumnHelper, type FilterFn } from "@tanstack/react-table";

import { TableActionMenu } from "@/components/common/TableActionMenu";
import { type TableSkeletonColumn } from "@/components/common/TableSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import type { ContactStatus, ContactSubmission } from "./contact-requests.types";

// Skeleton column layout mirrors the real table columns below.
export const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  { width: "flex-[2.2]", shape: "text", cellWidth: "w-48", headerWidth: "w-12" },
  { width: "flex-[1.4]", shape: "text", cellWidth: "w-32", headerWidth: "w-16" },
  { width: "flex-[2.6]", shape: "text", cellWidth: "w-56", headerWidth: "w-20" },
  { width: "flex-[1]", shape: "badge", cellWidth: "w-16", headerWidth: "w-12" },
  { width: "flex-[1.3]", shape: "text", cellWidth: "w-24", headerWidth: "w-14" },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

export function formatContactDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function pageWindow(current: number, total: number): (number | "…")[] {
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

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContactStatus, { cls: string; icon: React.ReactNode }> = {
  New: {
    cls: "bg-primary/10 text-primary border border-primary/20",
    icon: <Mail className="w-2.5 h-2.5" />,
  },
  Read: {
    cls: "bg-muted text-muted-foreground border border-border",
    icon: <MailOpen className="w-2.5 h-2.5" />,
  },
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const { cls, icon } = STATUS_CONFIG[status] ?? STATUS_CONFIG.New;
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-md tracking-wider ${cls}`}
    >
      {icon}
      {status}
    </span>
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<ContactSubmission>();

export const contactSearchFilter: FilterFn<ContactSubmission> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  const r = row.original;
  return (
    r.name.toLowerCase().includes(q) ||
    r.email.toLowerCase().includes(q) ||
    (r.subject ?? "").toLowerCase().includes(q) ||
    r.message.toLowerCase().includes(q)
  );
};

interface ColumnHandlers {
  onView: (row: ContactSubmission) => void;
  onToggleStatus: (row: ContactSubmission) => void;
  onDelete: (row: ContactSubmission) => void;
}

export function buildContactColumns({
  onView,
  onToggleStatus,
  onDelete,
}: ColumnHandlers) {
  return [
    columnHelper.display({
      id: "select",
      size: 48,
      enableSorting: false,
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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

    columnHelper.accessor("name", {
      header: "From",
      size: 240,
      cell: ({ row, getValue }) => {
        const r = row.original;
        return (
          <button
            type="button"
            onClick={() => onView(r)}
            className="text-left min-w-0 block"
          >
            <span className="font-semibold text-foreground truncate block max-w-[220px]">
              {getValue()}
            </span>
            <span className="text-[11px] text-muted-foreground truncate block max-w-[220px]">
              {r.email}
            </span>
          </button>
        );
      },
    }),

    columnHelper.accessor("phone", {
      header: "Phone",
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() || "—"}</span>
      ),
    }),

    columnHelper.accessor("message", {
      header: "Message",
      size: 320,
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <div className="min-w-0">
          {row.original.subject && (
            <span className="font-medium text-foreground block truncate max-w-[280px]">
              {row.original.subject}
            </span>
          )}
          <span className="text-muted-foreground text-[13px] truncate block max-w-[280px]">
            {getValue()}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Status",
      size: 110,
      cell: ({ getValue }) => <ContactStatusBadge status={getValue()} />,
    }),

    columnHelper.accessor("createdAt", {
      header: "Received",
      size: 130,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatContactDate(getValue())}
        </span>
      ),
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
                {
                  label: "View",
                  icon: <Eye size={13} />,
                  onClick: () => onView(r),
                },
                {
                  label: r.status === "New" ? "Mark as Read" : "Mark as New",
                  icon:
                    r.status === "New" ? (
                      <MailOpen size={13} />
                    ) : (
                      <Mail size={13} />
                    ),
                  onClick: () => onToggleStatus(r),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={13} />,
                  onClick: () => onDelete(r),
                  variant: "danger",
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
