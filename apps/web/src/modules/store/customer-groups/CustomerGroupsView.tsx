"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Plus, Search, Pencil, Trash2, Settings2, Users2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { storeCustomerGroups, type ApiCustomerGroup } from "@/lib/api";

const columnHelper = createColumnHelper<ApiCustomerGroup>();

function discountLabel(group: ApiCustomerGroup) {
  if (!group.discountType || group.discountValue == null) return "—";
  return group.discountType === "percentage"
    ? `${group.discountValue}% off`
    : `$${group.discountValue} off`;
}

function getColumns(t: any, router: ReturnType<typeof useRouter>, onDelete: (g: ApiCustomerGroup) => void) {
  return [
    columnHelper.accessor("name", {
      header: () => t("nameHeader", { defaultValue: "Name" }),
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-foreground text-[13px]">{row.original.name}</p>
          {row.original.description && (
            <p className="text-[11px] text-muted-foreground truncate max-w-xs">{row.original.description}</p>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: "discount",
      header: () => t("discountHeader", { defaultValue: "Discount" }),
      cell: ({ row }) =>
        row.original.discountType ? (
          <StatusBadge variant="success" label={discountLabel(row.original)} size="sm" />
        ) : (
          <span className="text-muted-foreground/40 text-xs">—</span>
        ),
    }),
    columnHelper.accessor((row) => row._count.customers, {
      id: "customers",
      header: () => t("customersHeader", { defaultValue: "Customers" }),
      cell: ({ getValue }) => (
        <span className="font-semibold text-foreground tabular-nums">{getValue()}</span>
      ),
    }),
    columnHelper.accessor((row) => row._count.tierPrices, {
      id: "tierPrices",
      header: () => t("tierPricesHeader", { defaultValue: "Tier Prices" }),
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: () => t("createdHeader", { defaultValue: "Created" }),
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      size: 56,
      enableSorting: false,
      header: "",
      cell: ({ row }) => (
        <TableActionMenu
          items={[
            {
              label: t("editAction", { defaultValue: "Edit" }),
              icon: <Pencil size={14} />,
              onClick: () => router.push(`/store/customer-groups/${row.original.id}/edit`),
            },
            {
              label: t("restrictionsAction", { defaultValue: "Manage Restrictions" }),
              icon: <Settings2 size={14} />,
              onClick: () => router.push(`/store/customer-groups/${row.original.id}/restrictions`),
            },
            {
              label: t("deleteAction", { defaultValue: "Delete" }),
              icon: <Trash2 size={14} />,
              onClick: () => onDelete(row.original),
              variant: "danger",
              separator: true,
            },
          ]}
        />
      ),
    }),
  ];
}

export function CustomerGroupsView() {
  const t = useTranslations("store.customerGroups");
  const router = useRouter();
  const isLoaded = usePageLoad(500);

  const [groups, setGroups] = useState<ApiCustomerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteTarget, setDeleteTarget] = useState<ApiCustomerGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeCustomerGroups.list();
      setGroups(res.data);
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [search, groups]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await storeCustomerGroups.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      // keep dialog open on error
    } finally {
      setIsDeleting(false);
    }
  };

  const table = useReactTable({
    data: rows,
    columns: getColumns(t, router, setDeleteTarget),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalCustomers = groups.reduce((sum, g) => sum + g._count.customers, 0);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("deleteTitle", { defaultValue: "Delete Customer Group" })}
        description={
          deleteTarget
            ? deleteTarget._count.tierPrices > 0
              ? t("deleteDescriptionWithTierPrices", {
                  defaultValue: `Are you sure you want to delete "${deleteTarget.name}"? Customers in this group will be unassigned, not deleted — but all ${deleteTarget._count.tierPrices} tier price(s) configured for this group will be permanently deleted.`,
                  name: deleteTarget.name,
                  count: deleteTarget._count.tierPrices,
                })
              : t("deleteDescription", {
                  defaultValue: `Are you sure you want to delete "${deleteTarget.name}"? Customers in this group will be unassigned, not deleted.`,
                  name: deleteTarget.name,
                })
            : ""
        }
        confirmLabel={isDeleting ? t("deleting", { defaultValue: "Deleting…" }) : t("delete", { defaultValue: "Delete" })}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {!isLoaded || isLoading ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title={t("title", { defaultValue: "Customer Groups" })}
            description={t("description", {
              defaultValue: `${groups.length} group${groups.length !== 1 ? "s" : ""} — segment customers for pricing, visibility, and B2B rules`,
            })}
            breadcrumbs={[
              { label: t("store", { defaultValue: "Store" }), href: "/store" },
              { label: t("title", { defaultValue: "Customer Groups" }) },
            ]}
          >
            <Button size="lg" onClick={() => router.push("/store/customer-groups/add")}>
              <Plus className="stroke-[3] h-4 w-4" /> {t("addGroup", { defaultValue: "Add Group" })}
            </Button>
          </PageHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: t("totalGroups", { defaultValue: "Total Groups" }), value: groups.length, icon: Users2, color: "text-foreground" },
              { label: t("defaultGroups", { defaultValue: "Default Groups" }), value: groups.filter((g) => g.isDefault).length, icon: Users2, color: "text-primary" },
              { label: t("assignedCustomers", { defaultValue: "Assigned Customers" }), value: totalCustomers, icon: Users2, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-3 flex items-center gap-3">
                <s.icon size={15} className={s.color} />
                <div>
                  <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder", { defaultValue: "Search customer groups…" })}
              className="pl-9"
            />
          </div>

          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="text-[13px] font-semibold text-muted-foreground bg-muted border-b border-border select-none">
                      {hg.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        return (
                          <th
                            key={header.id}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                            className={`sticky top-0 bg-muted py-3.5 px-4 ${header.id === "actions" ? "text-right" : ""} ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                          >
                            <div className="flex items-center gap-1">
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              {canSort && (sorted === "asc" ? <ChevronUp size={13} className="text-primary shrink-0" /> : sorted === "desc" ? <ChevronDown size={13} className="text-primary shrink-0" /> : <ChevronsUpDown size={13} className="text-muted-foreground/40 shrink-0" />)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border text-[14px]">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground">
                        {search ? t("noSearchResults", { defaultValue: "No customer groups match your search." }) : (
                          <>
                            {t("noGroups", { defaultValue: "No customer groups yet." })}{" "}
                            <button onClick={() => router.push("/store/customer-groups/add")} className="text-primary underline cursor-pointer">
                              {t("addOne", { defaultValue: "Add one" })}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="group hover:bg-muted/40 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className={`py-4 px-4 ${cell.column.id === "actions" ? "text-right" : ""}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
