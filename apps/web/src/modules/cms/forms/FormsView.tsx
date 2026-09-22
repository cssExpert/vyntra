"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  HelpCircle,
  ListFilterPlus,
  ClipboardList,
  Globe,
  FileText,
  Lock,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";

import SectionTitle from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/common/Modal";
import { FilterPanel } from "@/components/common/FilterPanel";
import { FilterSelect } from "@/components/common/FilterSelect";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

import {
  SKELETON_COLUMNS,
  buildFormColumns,
  formNameFilter,
} from "./forms-table-config";
import { FormsTable } from "./FormsTable";
import { NewFormModal } from "./NewFormModal";
import { cmsForms, orgDomain, type OrgDomain } from "@/lib/api";
import { useSettings } from "@/providers/SettingsProvider";
import { Toaster, useToaster } from "@/components/common/Toaster";
import type { CmsForm, FormStatus } from "./forms.types";
import { Input } from "@/components/ui/input";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "vyntra.com";

type TabKey = "all" | FormStatus;

interface FormFilters {
  dateFrom: string;
  dateTo: string;
  dateField: "all" | "createdAt" | "updatedAt";
  status: "all" | FormStatus;
}

const DEFAULT_FILTERS: FormFilters = {
  dateFrom: "",
  dateTo: "",
  dateField: "all",
  status: "all",
};

export function FormsView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.forms");
  const router = useRouter();
  const { settings } = useSettings();
  const { toasts, addToast, dismiss } = useToaster();
  const [forms, setForms] = useState<CmsForm[]>([]);
  const [domain, setDomain] = useState<OrgDomain | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deletingForm, setDeletingForm] = useState<CmsForm | null>(null);
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FormFilters>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] =
    useState<FormFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      cmsForms.list().catch(() => [] as CmsForm[]),
      orgDomain.get().catch(() => null),
    ]).then(([data, domainData]) => {
      setForms(data as CmsForm[]);
      setDomain(domainData);
    }).finally(() => setIsLoading(false));
  }, []);

  const getFormUrl = useCallback((formSlug: string): string => {
    if (domain?.customDomain && domain.customDomainVerified) {
      return `https://${domain.customDomain}/form/${formSlug}`;
    }
    if (domain?.subdomain) {
      return `https://${domain.subdomain}.${PLATFORM_DOMAIN}/form/${formSlug}`;
    }
    const orgSlug = settings?.slug;
    return orgSlug
      ? `${window.location.origin}/sites/${orgSlug}/form/${formSlug}`
      : "#";
   
  }, [domain, settings]);

  // Lock outer scroll while table is mounted
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const formTabs = useMemo<MotionTabItem<TabKey>[]>(
    () => [
      { id: "all", label: "All", icon: ClipboardList, badge: forms.length },
      {
        id: "Published",
        label: "Published",
        icon: Globe,
        badge: forms.filter((f) => f.status === "Published").length,
      },
      {
        id: "Draft",
        label: "Drafts",
        icon: FileText,
        badge: forms.filter((f) => f.status === "Draft").length,
      },
      {
        id: "Closed",
        label: "Closed",
        icon: Lock,
        badge: forms.filter((f) => f.status === "Closed").length,
      },
    ],
    [forms],
  );

  const hasActiveFilters = useMemo(
    () => JSON.stringify(activeFilters) !== JSON.stringify(DEFAULT_FILTERS),
    [activeFilters],
  );

  const panelFilteredForms = useMemo(() => {
    return forms.filter((form) => {
      if (activeTab !== "all" && form.status !== activeTab) return false;
      if (
        activeFilters.status !== "all" &&
        form.status !== activeFilters.status
      )
        return false;
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        const from = activeFilters.dateFrom
          ? new Date(activeFilters.dateFrom)
          : null;
        const to = activeFilters.dateTo ? new Date(activeFilters.dateTo) : null;
        const inRange = (iso: string) => {
          const d = new Date(iso);
          if (isNaN(d.getTime())) return true;
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        };
        if (activeFilters.dateField === "createdAt" && !inRange(form.createdAt))
          return false;
        if (activeFilters.dateField === "updatedAt" && !inRange(form.updatedAt))
          return false;
        if (
          activeFilters.dateField === "all" &&
          !inRange(form.createdAt) &&
          !inRange(form.updatedAt)
        )
          return false;
      }
      return true;
    });
  }, [forms, activeTab, activeFilters]);

  const refresh = useCallback(() => {
    cmsForms.list().then((data) => setForms(data as CmsForm[])).catch(() => {});
  }, []);

  const handleDuplicate = useCallback((form: CmsForm) => {
    cmsForms.duplicate(form.id).then(refresh).catch(() => {});
  }, [refresh]);

  const columns = useMemo(
    () =>
      buildFormColumns({
        onEdit: (form) => router.push(`/cms/forms/${form.id}/edit`),
        onPreview: (form) => {
          const url = getFormUrl(form.slug);
          if (url !== "#") window.open(url, "_blank");
        },
        onCopyLink: (form) => {
          const url = getFormUrl(form.slug);
          if (url === "#") return;
          navigator.clipboard.writeText(url).then(() => {
            addToast("Link copied to clipboard", "success");
          }).catch(() => {
            addToast("Failed to copy link", "error");
          });
        },
        onDuplicate: handleDuplicate,
        onDelete: (form) => setDeletingForm(form),
      }),
    [handleDuplicate, getFormUrl, addToast],
  );

  const table = useReactTable({
    data: panelFilteredForms,
    columns,
    state: { globalFilter: searchTerm, sorting, rowSelection, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    globalFilterFn: formNameFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const handleChooseBlueprint = (blueprintKey: string | null) => {
    setNewFormOpen(false);
    router.push(
      blueprintKey
        ? `/cms/forms/new?blueprint=${blueprintKey}`
        : "/cms/forms/new",
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingForm) return;
    cmsForms.delete(deletingForm.id).then(() => {
      setForms((prev) => prev.filter((f) => f.id !== deletingForm.id));
    }).catch(() => {});
    setDeletingForm(null);
  };

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = Object.keys(rowSelection).length;
  const hasFiltersApplied =
    !!searchTerm || hasActiveFilters || activeTab !== "all";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <TableSkeleton columns={SKELETON_COLUMNS} rows={8} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionTitle
              title="Forms"
              paragraph={`${filteredCount} ${filteredCount === 1 ? "form" : "forms"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
              mb="0"
              className="!w-auto"
            />

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <FilterPanel
                title="Choose Filters"
                hasActiveFilters={hasActiveFilters}
                onSearch={() => setActiveFilters({ ...filterDraft })}
                onClear={() => {
                  setFilterDraft(DEFAULT_FILTERS);
                  setActiveFilters(DEFAULT_FILTERS);
                }}
                trigger={
                  <Button
                    variant="secondary"
                    size="lg"
                    radius="sm"
                    className="px-4 active:scale-[0.98]"
                    startIcon={<ListFilterPlus size={15} />}
                  >
                    Filters
                  </Button>
                }
              >
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Duration
                  </p>
                  <DateRangePicker
                    startDate={filterDraft.dateFrom}
                    endDate={filterDraft.dateTo}
                    onChange={(start, end) =>
                      setFilterDraft((f) => ({
                        ...f,
                        dateFrom: start,
                        dateTo: end,
                      }))
                    }
                  />
                </div>
                <FilterSelect
                  label="Date Filter On"
                  value={filterDraft.dateField}
                  onChange={(v) =>
                    setFilterDraft((f) => ({
                      ...f,
                      dateField: v as FormFilters["dateField"],
                    }))
                  }
                  options={[
                    { value: "all", label: "All" },
                    { value: "createdAt", label: "Created" },
                    { value: "updatedAt", label: "Updated On" },
                  ]}
                />
                <FilterSelect
                  label="Status"
                  value={filterDraft.status}
                  onChange={(v) =>
                    setFilterDraft((f) => ({
                      ...f,
                      status: v as FormFilters["status"],
                    }))
                  }
                  options={[
                    { value: "all", label: "All" },
                    { value: "Published", label: "Published" },
                    { value: "Draft", label: "Draft" },
                    { value: "Closed", label: "Closed" },
                  ]}
                />
              </FilterPanel>

              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search size={14} />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search forms…"
                  size="lg"
                  className="pl-9 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 w-48"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 h-full w-8 text-muted-foreground hover:text-foreground"
                  >
                    <X size={13} />
                  </Button>
                )}
              </div>

              {/* New form */}
              <Button
                onClick={() => setNewFormOpen(true)}
                radius="sm"
                size="md"
                className="px-4 font-semibold active:scale-[0.98] group"
                startIcon={
                  <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4" />
                }
              >
                New Form
              </Button>
            </div>
          </div>

          {/* ── Status tabs ─────────────────────────────────────────────── */}
          <MotionTabs
            tabs={formTabs}
            active={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            layoutId="cms-forms-tab"
            className="w-fit mt-5"
          />

          {/* ── Table ───────────────────────────────────────────────────── */}
          <FormsTable
            table={table}
            hasFiltersApplied={hasFiltersApplied}
            onCreateFirst={() => setNewFormOpen(true)}
          />

          {/* ── New form blueprint picker ───────────────────────────────── */}
          <NewFormModal
            isOpen={newFormOpen}
            onClose={() => setNewFormOpen(false)}
            onChoose={handleChooseBlueprint}
          />

          <Toaster toasts={toasts} onDismiss={dismiss} />

          {/* ── Delete modal ────────────────────────────────────────────── */}
          <Modal
            isOpen={!!deletingForm}
            onClose={() => setDeletingForm(null)}
            title="Delete Form?"
            description={
              <>
                Are you sure you want to delete{" "}
                <strong className="text-foreground">
                  &ldquo;{deletingForm?.name}&rdquo;
                </strong>
                ? All of its {deletingForm?.responses ?? 0} responses will be
                lost. This action cannot be undone.
              </>
            }
            icon={<HelpCircle size={20} />}
            iconVariant="danger"
            maxWidth="md"
            footer={
              <>
                <Button
                  variant="ghost"
                  radius="sm"
                  onClick={() => setDeletingForm(null)}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  radius="sm"
                  onClick={handleConfirmDelete}
                  className="px-5 font-semibold active:scale-95"
                >
                  Yes, Delete
                </Button>
              </>
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
