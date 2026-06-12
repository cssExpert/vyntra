"use client";

import { useTranslations } from "next-intl";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  Trash2,
  PencilLine,
  Eye,
  Copy,
  Download,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ListFilterPlus,
  Home,
  StarOff,
  LayoutTemplate,
  CheckCheck,
  Globe,
  Blocks,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type FilterFn,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";

import SectionTitle from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Modal } from "@/components/common/Modal";
import { FilterPanel } from "@/components/common/FilterPanel";
import { FilterSelect } from "@/components/common/FilterSelect";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import {
  TableSkeleton,
  type TableSkeletonColumn,
} from "@/components/common/TableSkeleton";
import { usePageLoad } from "@/hooks/usePageLoad";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import { cmsPages, cmsLayouts, type CmsLayout } from "@/lib/api";
import { PageTranslationsModal } from "./PageTranslationsModal";
import { Input } from "@/components/ui/input";

// Skeleton column layout mirrors the real table columns below.
const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  {
    width: "flex-[2.3]",
    shape: "text",
    cellWidth: "w-40",
    headerWidth: "w-10",
  },
  {
    width: "flex-[1.6]",
    shape: "text",
    cellWidth: "w-24",
    headerWidth: "w-14",
  },
  {
    width: "flex-[1.1]",
    shape: "badge",
    cellWidth: "w-16",
    headerWidth: "w-12",
  },
  {
    width: "flex-[1.4]",
    shape: "text",
    cellWidth: "w-24",
    headerWidth: "w-14",
  },
  {
    width: "flex-[1.4]",
    shape: "text",
    cellWidth: "w-24",
    headerWidth: "w-20",
  },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

export type PageStatus = "Public" | "Draft" | "Private";

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
  isLandingPage?: boolean;
}

function formatApiDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getFullYear()}`;
}

// ─── Module-level TanStack helpers ───────────────────────────────────────────

const columnHelper = createColumnHelper<CmsPage>();

const titleAuthorFilter: FilterFn<CmsPage> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  return (
    row.original.title.toLowerCase().includes(q) ||
    row.original.author.toLowerCase().includes(q)
  );
};

function todayFormatted(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getFullYear()}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PageStatus }) {
  const cls =
    status === "Public"
      ? "bg-emerald-500 text-white"
      : status === "Draft"
        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-[11px] px-2.5 py-1 rounded-md tracking-wider ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Pagination helper ────────────────────────────────────────────────────────

function pageWindow(current: number, total: number): (number | "…")[] {
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

// ─── Filter state ────────────────────────────────────────────────────────────

interface PageFilters {
  dateFrom: string;
  dateTo: string;
  dateField: "all" | "createdAt" | "updatedAt";
  status: "all" | PageStatus;
  author: string;
}

const DEFAULT_FILTERS: PageFilters = {
  dateFrom: "",
  dateTo: "",
  dateField: "all",
  status: "all",
  author: "all",
};

function parseMDY(s: string): Date | null {
  const [mm, dd, yyyy] = s.split("-");
  if (!mm || !dd || !yyyy) return null;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PagesView() {
  const t = useTranslations("cms.pages");
  const router = useRouter();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deletingPage, setDeletingPage] = useState<CmsPage | null>(null);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    slug: "",
    author: "",
    status: "Public" as PageStatus,
  });
  const [filterDraft, setFilterDraft] = useState<PageFilters>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] =
    useState<PageFilters>(DEFAULT_FILTERS);
  const [addFormData, setAddFormData] = useState({
    title: "",
    slug: "",
    layoutId: "",
  });
  const [availableLayouts, setAvailableLayouts] = useState<CmsLayout[]>([]);
  const [bulkLayoutId, setBulkLayoutId] = useState<string>("");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [translatingPage, setTranslatingPage] = useState<{ id: string; title: string; metaDesc: string | null; metaKeywords: string | null } | null>(null);
  const isLoaded = usePageLoad(700);
  const { previewUrl } = useSitePreviewUrl();
  // Ref so the memoized columns closure always reads the latest previewUrl
  // without needing to be recreated on every render.
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;

  useEffect(() => {
    cmsLayouts
      .list()
      .then(setAvailableLayouts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    cmsPages
      .list()
      .then((data) => {
        setPages(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            author: "-",
            status: p.published ? "Public" : "Draft",
            isLandingPage: p.isLandingPage,
            createdAt: formatApiDate(p.createdAt),
            updatedAt: formatApiDate(p.updatedAt),
          })),
        );
      })
      .catch(() => {
        setPages([]);
      })
      .finally(() => setIsFetching(false));
  }, []);

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(pages.map((p) => p.author))).sort(),
    [pages],
  );

  const hasActiveFilters = useMemo(
    () => JSON.stringify(activeFilters) !== JSON.stringify(DEFAULT_FILTERS),
    [activeFilters],
  );

  const panelFilteredPages = useMemo(() => {
    return pages
      .filter((page) => {
        if (
          activeFilters.status !== "all" &&
          page.status !== activeFilters.status
        )
          return false;
        if (
          activeFilters.author !== "all" &&
          page.author !== activeFilters.author
        )
          return false;
        if (activeFilters.dateFrom || activeFilters.dateTo) {
          const from = activeFilters.dateFrom
            ? new Date(activeFilters.dateFrom)
            : null;
          const to = activeFilters.dateTo
            ? new Date(activeFilters.dateTo)
            : null;
          const inRange = (dateStr: string) => {
            const d = parseMDY(dateStr);
            if (!d) return true;
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
          };
          if (
            activeFilters.dateField === "createdAt" &&
            !inRange(page.createdAt)
          )
            return false;
          if (
            activeFilters.dateField === "updatedAt" &&
            !inRange(page.updatedAt)
          )
            return false;
          if (
            activeFilters.dateField === "all" &&
            !inRange(page.createdAt) &&
            !inRange(page.updatedAt)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => (b.isLandingPage ? 1 : 0) - (a.isLandingPage ? 1 : 0));
  }, [pages, activeFilters]);

  const handleEditPageClick = (page: CmsPage) => {
    router.push(`/cms/editor?page=${encodeURIComponent(page.slug)}`);
  };

  const handleSetLandingPage = (page: CmsPage) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        isLandingPage: p.id === page.id ? true : false,
      })),
    );
  };

  const handleUnsetLandingPage = (page: CmsPage) => {
    setPages((prev) =>
      prev.map((p) => (p.id === page.id ? { ...p, isLandingPage: false } : p)),
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setPages((prev) =>
      prev.map((p) =>
        p.id === editingPage.id
          ? { ...p, ...editFormData, updatedAt: todayFormatted() }
          : p,
      ),
    );
    setIsModalOpen(false);
    setEditingPage(null);
  };

  // Disable outer page scroll — table scrolls internally
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const columns = useMemo(
    () => [
      // ── Checkbox ──────────────────────────────────────────────────────────
      columnHelper.display({
        id: "select",
        size: 50,
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

      // ── Title ─────────────────────────────────────────────────────────────
      columnHelper.accessor("title", {
        header: "Title",
        size: 230,
        cell: ({ row, getValue }) => {
          const page = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEditPageClick(page)}
                className="text-primary font-semibold cursor-pointer hover:underline underline-offset-2"
              >
                {getValue()}
              </button>
              {page.isLandingPage && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Home size={9} className="shrink-0" />
                  Landing
                </span>
              )}
            </div>
          );
        },
      }),

      // ── Author ────────────────────────────────────────────────────────────
      columnHelper.accessor("author", {
        header: "Author",
        size: 160,
        cell: ({ getValue }) => getValue(),
      }),

      // ── Status ────────────────────────────────────────────────────────────
      columnHelper.accessor("status", {
        header: "Status",
        size: 110,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      }),

      // ── Created ───────────────────────────────────────────────────────────
      columnHelper.accessor("createdAt", {
        header: "Created",
        size: 140,
        cell: ({ getValue }) => getValue(),
      }),

      // ── Updated on ────────────────────────────────────────────────────────
      columnHelper.accessor("updatedAt", {
        header: "Updated on",
        size: 140,
        cell: ({ getValue }) => getValue(),
      }),

      // ── Actions ───────────────────────────────────────────────────────────
      columnHelper.display({
        id: "actions",
        header: "Action",
        size: 90,
        enableSorting: false,
        cell: ({ row }) => {
          const page = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                dropdownWidth={220}
                items={[
                  {
                    label: "Edit",
                    icon: <PencilLine size={13} className="stroke-[2.5]" />,
                    onClick: () => handleEditPageClick(page),
                  },
                  {
                    label: "Preview",
                    icon: <Eye size={13} />,
                    onClick: () => {
                      const url = previewUrlRef.current(page.slug);
                      if (url) window.open(url, "_blank");
                    },
                  },
                  {
                    label: "Duplicate",
                    icon: <Copy size={13} />,
                    onClick: () => {
                      const today = todayFormatted();
                      setPages((prev) => [
                        ...prev,
                        {
                          ...page,
                          id: Date.now().toString(),
                          title: `${page.title} (Copy)`,
                          slug: `${page.slug}-copy-${Date.now()}`,
                          status: "Draft",
                          isLandingPage: false,
                          createdAt: today,
                          updatedAt: today,
                        },
                      ]);
                    },
                  },
                  {
                    label: "Theme Builder",
                    icon: <Blocks size={13} />,
                    onClick: () => router.push(`/cms/theme-builder?page=${encodeURIComponent(page.slug)}`),
                  },
                  {
                    label: "Translations",
                    icon: <Globe size={13} />,
                    onClick: async () => {
                      const detail = await cmsPages.load(page.slug).catch(() => null);
                      setTranslatingPage({
                        id: page.id,
                        title: page.title,
                        metaDesc: detail?.metaDesc ?? null,
                        metaKeywords: detail?.metaKeywords ?? null,
                      });
                    },
                  },
                  page.isLandingPage
                    ? {
                        label: "Remove Landing Page",
                        icon: <StarOff size={13} />,
                        onClick: () => handleUnsetLandingPage(page),
                        separator: true,
                      }
                    : {
                        label: "Set as Landing Page",
                        icon: <Home size={13} />,
                        onClick: () => handleSetLandingPage(page),
                        separator: true,
                      },
                  {
                    label: "Delete",
                    icon: <Trash2 size={13} />,
                    onClick: () => setDeletingPage(page),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: panelFilteredPages,
    columns,
    state: { globalFilter: searchTerm, sorting, rowSelection, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    globalFilterFn: titleAuthorFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const handleConfirmDelete = () => {
    if (!deletingPage) return;
    setPages((prev) => prev.filter((p) => p.id !== deletingPage.id));
    setDeletingPage(null);
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();
  const selectedCount = Object.keys(rowSelection).length;
  const handleAddPageClick = () => {
    setAddFormData({ title: "", slug: "", layoutId: "" });
    setEditingPage(null);
    setIsModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = addFormData.slug.trim();
    if (!slug) return;
    const params = new URLSearchParams({ page: slug });
    if (addFormData.layoutId) params.set("layoutId", addFormData.layoutId);
    router.push(`/cms/editor?${params.toString()}`);
    setIsModalOpen(false);
  };

  const handleBulkApplyLayout = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const pageIds = selectedRows.map((r) => r.original.id);
    if (!pageIds.length) return;
    setBulkApplying(true);
    try {
      await cmsPages.bulkUpdateLayout(pageIds, bulkLayoutId || null);
      setRowSelection({});
      setBulkLayoutId("");
    } finally {
      setBulkApplying(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded || isFetching ? (
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
          {/* ── Page Header ────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionTitle
              title={t("pages", { defaultValue: "Pages" })}
              paragraph={`${filteredCount} ${filteredCount === 1 ? "page" : "pages"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
              mb="0"
              className="!w-auto"
            />

            <div className="flex items-center gap-2">
              <Button
                size="lg"
                radius="sm"
                onClick={handleAddPageClick}
                className="px-4 active:scale-[0.98] group"
                startIcon={
                  <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300" />
                }
              >
                Add Page
              </Button>
              <Button
                variant="outline"
                size="lg"
                radius="sm"
                className="px-4 active:scale-[0.98]"
                startIcon={<Download size={15} />}
              >
                Export
              </Button>

              {/* Apply Filters */}
              <FilterPanel
                title={t("choosefilters", { defaultValue: "Choose Filters" })}
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
                    Apply Filters
                  </Button>
                }
              >
                {/* Duration */}
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

                {/* Date Filter On */}
                <FilterSelect
                  label="Date Filter On"
                  value={filterDraft.dateField}
                  onChange={(v) =>
                    setFilterDraft((f) => ({
                      ...f,
                      dateField: v as PageFilters["dateField"],
                    }))
                  }
                  options={[
                    { value: "all", label: "All" },
                    { value: "createdAt", label: "Created" },
                    { value: "updatedAt", label: "Updated On" },
                  ]}
                />

                {/* Status */}
                <FilterSelect
                  label="Status"
                  value={filterDraft.status}
                  onChange={(v) =>
                    setFilterDraft((f) => ({
                      ...f,
                      status: v as PageFilters["status"],
                    }))
                  }
                  options={[
                    { value: "all", label: "All" },
                    { value: "Public", label: "Public" },
                    { value: "Draft", label: "Draft" },
                    { value: "Private", label: "Private" },
                  ]}
                />

                {/* Author */}
                <FilterSelect
                  label="Author"
                  value={filterDraft.author}
                  onChange={(v) => setFilterDraft((f) => ({ ...f, author: v }))}
                  options={[
                    { value: "all", label: "All" },
                    ...uniqueAuthors.map((a) => ({ value: a, label: a })),
                  ]}
                />
              </FilterPanel>

              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search size={15} />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search pages..."
                  size="xl" className="pl-9 pr-8 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 w-52"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Bulk action bar ────────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                key="bulk-bar"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mt-4 flex items-center gap-3 flex-wrap rounded-lg border border-primary/25 bg-primary/5 px-4 py-3"
              >
                <span className="text-sm font-semibold text-primary shrink-0">
                  {selectedCount} page{selectedCount !== 1 ? "s" : ""} selected
                </span>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <LayoutTemplate
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <select
                    value={bulkLayoutId}
                    onChange={(e) => setBulkLayoutId(e.target.value)}
                    className="flex-1 min-w-0 max-w-xs rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  >
                    <option value="">Use default layout</option>
                    {availableLayouts.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                        {l.isDefault ? " (default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  size="sm"
                  radius="md"
                  onClick={handleBulkApplyLayout}
                  loading={bulkApplying}
                  loadingText="Applying…"
                  className="px-4 text-sm font-semibold active:scale-95 shrink-0"
                  startIcon={<CheckCheck size={14} />}
                >
                  Apply
                </Button>

                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setRowSelection({});
                    setBulkLayoutId("");
                  }}
                  className="gap-1 px-0 text-sm text-muted-foreground hover:text-foreground hover:no-underline shrink-0"
                  startIcon={<X size={13} />}
                >
                  Deselect
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Table Card ─────────────────────────────────────────────────── */}
          <div className="mt-4 bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 270px)" }}
            >
              <table
                className="text-left border-collapse"
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  minWidth: "920px",
                }}
              >
                {/* Thead */}
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="text-[13px] font-semibold text-muted-foreground select-none"
                    >
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const isActions = header.id === "actions";
                        const isSelect = header.id === "select";
                        return (
                          <th
                            key={header.id}
                            onClick={
                              canSort
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            style={{ width: header.getSize() }}
                            className={`sticky top-0 z-10 bg-muted font-semibold py-4 px-4 border-b border-border ${isActions ? "text-right" : ""} ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                          >
                            <div
                              className={`flex items-center gap-1 ${isActions ? "justify-end" : isSelect ? "justify-center" : ""}`}
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

                {/* Tbody */}
                <tbody className="divide-y divide-border text-[14px]">
                  <AnimatePresence initial={false}>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <motion.tr
                          key={row.id}
                          layoutId={`page-row-${row.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-muted/40 transition-colors ${
                            row.getIsSelected() ? "bg-primary/5" : ""
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const id = cell.column.id;
                            const tdCls =
                              id === "select"
                                ? "py-4 px-4"
                                : id === "title"
                                  ? "py-4 px-4 font-medium text-foreground"
                                  : id === "actions"
                                    ? "py-4 px-4 text-right"
                                    : "py-4 px-4 text-muted-foreground";
                            return (
                              <td
                                key={cell.id}
                                className={tdCls}
                                style={{ width: cell.column.getSize() }}
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
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="py-14 text-center text-muted-foreground bg-muted/10"
                        >
                          <p className="font-semibold text-foreground mb-1">
                            No pages found
                          </p>
                          <p className="text-xs">
                            Try adjusting your search or add a new page.
                          </p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* ── Table Footer: entries selector + pagination ─────────────── */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
              {/* Show N entries */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  Showing {fromEntry} to {toEntry} of {filteredCount} entries
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    radius="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 px-3 text-muted-foreground"
                  >
                    ← Previous
                  </Button>

                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 text-center text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={pageIndex === p ? "default" : "outline"}
                        size="icon"
                        radius="sm"
                        onClick={() => table.setPageIndex(p)}
                        className={`w-8 h-8 text-sm font-semibold ${
                          pageIndex === p ? "" : "text-muted-foreground"
                        }`}
                      >
                        {p + 1}
                      </Button>
                    ),
                  )}

                  <Button
                    variant="outline"
                    radius="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 px-3 text-muted-foreground"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Add / Edit Page Modal ──────────────────────────────────────── */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingPage(null);
            }}
            title={editingPage ? `Edit "${editingPage.title}"` : "New Page"}
            description={
              editingPage
                ? "Update page details."
                : "Set a title and URL slug, then build the page in the editor."
            }
            icon={
              editingPage ? (
                <PencilLine size={18} className="stroke-[2.5]" />
              ) : (
                <Plus size={18} className="stroke-[2.5]" />
              )
            }
            maxWidth="md"
            footer={
              <>
                <Button
                  variant="ghost"
                  radius="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPage(null);
                  }}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="page-form"
                  radius="sm"
                  className="px-5 font-semibold shadow-sm active:scale-95"
                >
                  {editingPage ? "Save Changes" : "Open in Editor →"}
                </Button>
              </>
            }
          >
            {editingPage ? (
              <form id="page-form" onSubmit={handleEditSubmit}>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Title
                    </label>
                    <Input
                      required
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData((f) => ({
                          ...f,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Page title"
                      size="xl" className="w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData((f) => ({
                          ...f,
                          status: e.target.value as PageStatus,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    >
                      <option value="Public">Public</option>
                      <option value="Draft">Draft</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>
              </form>
            ) : (
              <form id="page-form" onSubmit={handleAddSubmit}>
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Page Title
                    </label>
                    <Input
                      required
                      autoFocus
                      value={addFormData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .trim()
                          .replace(/\s+/g, "-");
                        setAddFormData((prev) => ({ ...prev, title, slug }));
                      }}
                      placeholder="e.g. About Us"
                      size="xl" className="w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      URL Slug
                    </label>
                    <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all overflow-hidden">
                      <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-border bg-muted/50 shrink-0 select-none">
                        /
                      </span>
                      <input
                        required
                        value={addFormData.slug}
                        onChange={(e) =>
                          setAddFormData((f) => ({
                            ...f,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          }))
                        }
                        placeholder="about-us"
                        className="flex-1 px-3 py-2.5 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will be the page URL — e.g.{" "}
                      <span className="font-mono">yourdomain.com/about-us</span>
                    </p>
                  </div>
                  {availableLayouts.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Layout
                      </label>
                      <select
                        value={addFormData.layoutId}
                        onChange={(e) =>
                          setAddFormData((f) => ({
                            ...f,
                            layoutId: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      >
                        <option value="">Use default layout</option>
                        {availableLayouts.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                            {l.isDefault ? " (default)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </form>
            )}
          </Modal>

          {/* ── Translations modal ─────────────────────────────────────────── */}
          <PageTranslationsModal
            page={translatingPage}
            onClose={() => setTranslatingPage(null)}
          />

          {/* ── Delete confirmation modal ───────────────────────────────────── */}
          <Modal
            isOpen={!!deletingPage}
            onClose={() => setDeletingPage(null)}
            title={t("deletepage", { defaultValue: "Delete Page?" })}
            description={
              <>
                Are you sure you want to delete{" "}
                <strong className="text-foreground font-bold">
                  &ldquo;{deletingPage?.title}&rdquo;
                </strong>
                ? This action cannot be undone.
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
                  onClick={() => setDeletingPage(null)}
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
