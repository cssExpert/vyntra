import {
  ClipboardList,
  Globe,
  FileText,
  Lock,
  PencilLine,
  Eye,
  Copy,
  Trash2,
  Inbox,
  Link,
} from "lucide-react";
import { createColumnHelper, type FilterFn } from "@tanstack/react-table";

import { TableActionMenu } from "@/components/common/TableActionMenu";
import { type TableSkeletonColumn } from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import type { CmsForm, FormStatus } from "./forms.types";

// Skeleton column layout mirrors the real table columns below.
export const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  { width: "flex-[2.6]", shape: "text", cellWidth: "w-48", headerWidth: "w-12" },
  { width: "flex-[1.1]", shape: "badge", cellWidth: "w-16", headerWidth: "w-12" },
  { width: "flex-[1]", shape: "text", cellWidth: "w-14", headerWidth: "w-16" },
  { width: "flex-[1.3]", shape: "text", cellWidth: "w-24", headerWidth: "w-14" },
  { width: "flex-[1.3]", shape: "text", cellWidth: "w-24", headerWidth: "w-20" },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

export function formatFormDate(iso: string): string {
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

const STATUS_CONFIG: Record<FormStatus, { cls: string; icon: React.ReactNode }> =
  {
    Published: {
      cls: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
      icon: <Globe className="w-2.5 h-2.5" />,
    },
    Draft: {
      cls: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
      icon: <FileText className="w-2.5 h-2.5" />,
    },
    Closed: {
      cls: "bg-muted text-muted-foreground border border-border",
      icon: <Lock className="w-2.5 h-2.5" />,
    },
  };

export function FormStatusBadge({ status }: { status: FormStatus }) {
  const { cls, icon } = STATUS_CONFIG[status] ?? STATUS_CONFIG.Draft;
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

const columnHelper = createColumnHelper<CmsForm>();

export const formNameFilter: FilterFn<CmsForm> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  return (
    row.original.name.toLowerCase().includes(q) ||
    row.original.slug.toLowerCase().includes(q)
  );
};

interface ColumnHandlers {
  onEdit: (form: CmsForm) => void;
  onPreview: (form: CmsForm) => void;
  onCopyLink: (form: CmsForm) => void;
  onDuplicate: (form: CmsForm) => void;
  onDelete: (form: CmsForm) => void;
}

export function buildFormColumns({
  onEdit,
  onPreview,
  onCopyLink,
  onDuplicate,
  onDelete,
}: ColumnHandlers) {
  return [
    columnHelper.display({
      id: "select",
      size: 48,
      enableSorting: false,
      header: ({ table }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el)
                el.indeterminate =
                  !table.getIsAllPageRowsSelected() &&
                  table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 rounded-sm border-border accent-primary cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded-sm border-border accent-primary cursor-pointer"
          />
        </div>
      ),
    }),

    columnHelper.accessor("name", {
      header: "Form",
      size: 300,
      cell: ({ row, getValue }) => {
        const form = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 shrink-0 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <Button
                type="button"
                variant="link"
                onClick={() => onEdit(form)}
                className="font-semibold text-foreground hover:text-primary h-auto p-0 text-left truncate block max-w-[240px]"
              >
                {getValue()}
              </Button>
              <span className="text-[11px] text-muted-foreground truncate block">
                {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}{" "}
                · /forms/{form.slug}
              </span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      cell: ({ getValue }) => <FormStatusBadge status={getValue()} />,
    }),

    columnHelper.accessor("responses", {
      header: "Responses",
      size: 110,
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Inbox className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="font-medium text-foreground tabular-nums">
            {getValue()}
          </span>
        </span>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: "Created",
      size: 130,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatFormDate(getValue())}
        </span>
      ),
    }),

    columnHelper.accessor("updatedAt", {
      header: "Updated on",
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatFormDate(getValue())}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "Action",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const form = row.original;
        return (
          <div className="flex justify-end">
            <TableActionMenu
              items={[
                {
                  label: "Edit",
                  icon: <PencilLine size={13} className="stroke-[2.5]" />,
                  onClick: () => onEdit(form),
                },
                {
                  label: "Preview",
                  icon: <Eye size={13} />,
                  onClick: () => onPreview(form),
                },
                {
                  label: "Copy Link",
                  icon: <Link size={13} />,
                  onClick: () => onCopyLink(form),
                },
                {
                  label: "Duplicate",
                  icon: <Copy size={13} />,
                  onClick: () => onDuplicate(form),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={13} />,
                  onClick: () => onDelete(form),
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
