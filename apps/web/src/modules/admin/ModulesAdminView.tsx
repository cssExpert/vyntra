"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Boxes,
  Pencil,
  Eye,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users2,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  TowerControl,
  Store,
  CreditCard,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { admin, type AdminModule } from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";

interface ModuleDetail extends AdminModule {
  companies?: Array<{ id: string; name: string; slug: string }>;
}

const MODULE_ICON_MAP: Record<string, LucideIcon> = {
  CRM:        Users2,
  EMAIL:      Mail,
  CALLING:    Phone,
  CMS:        FileText,
  SEO:        TrendingUp,
  LIGHTHOUSE: TowerControl,
  MAIL:       Mail,
  STORE:      Store,
  PAYMENTS:   CreditCard,
  REPORTS:    BarChart3,
};

const columnHelper = createColumnHelper<AdminModule>();

function Inner() {
  const t = useTranslations("admin.modules");
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setModules(await admin.listModules());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (m: AdminModule) => {
    try {
      const detail = await admin.getModule(m.id);
      setSelectedModule(detail as ModuleDetail);
      setDetailOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load module details");
    }
  };

  const openEdit = (m: AdminModule | ModuleDetail) => {
    setSelectedModule(m as ModuleDetail);
    setEditForm({ name: m.name, description: m.description || "" });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedModule) return;
    setEditBusy(true);
    setError("");
    try {
      await admin.updateModule(selectedModule.id, {
        name: editForm.name,
        description: editForm.description || undefined,
      });
      setEditOpen(false);
      await load();
      const updated = await admin.getModule(selectedModule.id);
      setSelectedModule(updated as ModuleDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update module");
    } finally {
      setEditBusy(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("name", { defaultValue: "Module" }),
        size: 220,
        cell: ({ row, getValue }) => {
          const ModuleIcon = MODULE_ICON_MAP[row.original.key] ?? Boxes;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ModuleIcon className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{getValue()}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("key", {
        header: t("key", { defaultValue: "Key" }),
        size: 180,
        cell: ({ getValue }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{getValue()}</code>
        ),
      }),
      columnHelper.accessor("description", {
        header: t("description", { defaultValue: "Description" }),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue() ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: t("active", { defaultValue: "Status" }),
        size: 130,
        cell: ({ getValue }) => (
          <StatusBadge
            variant={getValue() ? "success" : "muted"}
            label={getValue() ? t("active", { defaultValue: "Active" }) : t("disabled", { defaultValue: "Disabled" })}
            dot
            size="sm"
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: t("actions", { defaultValue: "Actions" }),
        size: 90,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                items={[
                  {
                    label: t("viewDetails", { defaultValue: "View Details" }),
                    icon: <Eye size={14} />,
                    onClick: () => openDetail(m),
                  },
                  {
                    label: t("edit", { defaultValue: "Edit" }),
                    icon: <Pencil size={14} />,
                    onClick: () => openEdit(m),
                  },
                ]}
              />
            </div>
          );
        },
      }),
    ],
     
    []
  );

  const filteredModules = useMemo(
    () =>
      modules.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      ),
    [modules, searchTerm]
  );

  const table = useReactTable({
    data: filteredModules,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("search", { defaultValue: "Search modules..." })}
          className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">{t("loading", { defaultValue: "Loading…" })}</div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">{t("noResults", { defaultValue: "No modules found" })}</div>
          ) : (
            <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/40"
                  >
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={`px-4 py-3 font-medium text-left ${
                            canSort ? "cursor-pointer hover:text-foreground" : ""
                          }`}
                          style={{ width: header.getSize() }}
                        >
                          <div className="flex items-center gap-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort &&
                              (sorted === "asc" ? (
                                <ChevronUp size={14} className="text-primary shrink-0" />
                              ) : sorted === "desc" ? (
                                <ChevronDown size={14} className="text-primary shrink-0" />
                              ) : (
                                <ChevronsUpDown size={14} className="text-muted-foreground/40 shrink-0" />
                              ))}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Module Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedModule(null);
        }}
        title={selectedModule?.name}
        description={t("viewDetails", { defaultValue: "View module details and usage." })}
        maxWidth="lg"
        footer={
          <button
            onClick={() => selectedModule && openEdit(selectedModule)}
            className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
          >
            <Pencil className="h-4 w-4" /> {t("edit", { defaultValue: "Edit" })}
          </button>
        }
      >
        <div className="px-6 py-5 space-y-6">
          {selectedModule && (
            <>
              <div className="grid gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("key", { defaultValue: "Key" })}</p>
                  <p className="mt-1 font-mono text-sm">{selectedModule.key}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("description", { defaultValue: "Description" })}</p>
                  <p className="mt-1 text-sm">{selectedModule.description || t("noDescription", { defaultValue: "No description" })}</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-semibold text-foreground mb-4">{t("usingThisModule", { defaultValue: "Using This Module" })}</h4>
                {selectedModule.companies && selectedModule.companies.length > 0 ? (
                  <div className="space-y-2">
                    {selectedModule.companies.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                      >
                        <span className="font-medium text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.slug}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("noCompaniesUsingModule", { defaultValue: "No companies are using this module yet." })}</p>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit Module Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("edit", { defaultValue: "Edit Module" })}
        description={t("updateModuleDetails", { defaultValue: "Update module details." })}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition cursor-pointer"
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              onClick={saveEdit}
              disabled={editBusy || !editForm.name}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {editBusy ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
            </button>
          </div>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("name", { defaultValue: "Name" })}</label>
            <input
              className={adminInput}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder={t("moduleName", { defaultValue: "Module name" })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("description", { defaultValue: "Description" })}</label>
            <input
              className={adminInput}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder={t("moduleDescription", { defaultValue: "Module description" })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ModulesAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
