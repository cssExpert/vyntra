import { Mail, Trash2 } from "lucide-react";
import { createColumnHelper, type FilterFn } from "@tanstack/react-table";

import { TableActionMenu } from "@/components/common/TableActionMenu";
import { type TableSkeletonColumn } from "@/components/common/TableSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import type { NewsletterSubscriber } from "./newsletter-subscribers.types";

// Skeleton column layout mirrors the real table columns below.
export const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  { width: "flex-[2]", shape: "text", cellWidth: "w-40", headerWidth: "w-12" },
  { width: "flex-[2.4]", shape: "text", cellWidth: "w-52", headerWidth: "w-16" },
  { width: "flex-[1.3]", shape: "text", cellWidth: "w-24", headerWidth: "w-14" },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

export function formatSubscriberDate(iso: string): string {
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

// ─── Columns ─────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<NewsletterSubscriber>();

export const subscriberSearchFilter: FilterFn<NewsletterSubscriber> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  const r = row.original;
  return (
    r.email.toLowerCase().includes(q) ||
    (r.name ?? "").toLowerCase().includes(q)
  );
};

interface ColumnHandlers {
  onDelete: (row: NewsletterSubscriber) => void;
}

export function buildSubscriberColumns({ onDelete }: ColumnHandlers) {
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
      header: "Name",
      size: 200,
      cell: ({ getValue }) => (
        <span className="font-semibold text-foreground truncate block max-w-[180px]">
          {getValue() || "—"}
        </span>
      ),
    }),

    columnHelper.accessor("email", {
      header: "Email",
      size: 260,
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-foreground truncate block max-w-[220px]">
            {getValue()}
          </span>
        </span>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: "Subscribed",
      size: 130,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatSubscriberDate(getValue())}
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
                  label: "Delete",
                  icon: <Trash2 size={13} />,
                  onClick: () => onDelete(r),
                  variant: "danger",
                },
              ]}
            />
          </div>
        );
      },
    }),
  ];
}
