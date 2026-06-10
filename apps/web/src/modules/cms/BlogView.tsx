"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ListFilterPlus,
  BookOpen,
  Globe,
  FileText,
  Clock,
  RefreshCw,
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
import { cmsBlogs } from "@/lib/api";
import { type BlogStatus, type CmsBlog } from "@/modules/cms/blog-data";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function deriveStatus(published: boolean, publishedAt: string | null): BlogStatus {
  if (published) return "Public";
  if (publishedAt && new Date(publishedAt) > new Date()) return "Scheduled";
  return "Draft";
}

function parseMDY(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Static config ────────────────────────────────────────────────────────────

const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  { width: "flex-[3]", shape: "text", cellWidth: "w-56", headerWidth: "w-10" },
  { width: "flex-[1.4]", shape: "text", cellWidth: "w-24", headerWidth: "w-14" },
  { width: "flex-[1.1]", shape: "badge", cellWidth: "w-16", headerWidth: "w-12" },
  { width: "flex-[1.3]", shape: "text", cellWidth: "w-24", headerWidth: "w-14" },
  { width: "flex-[1.4]", shape: "text", cellWidth: "w-24", headerWidth: "w-24" },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

const columnHelper = createColumnHelper<CmsBlog>();

const titleAuthorFilter: FilterFn<CmsBlog> = (row, _columnId, filterValue: string) => {
  const q = filterValue.toLowerCase();
  return (
    row.original.title.toLowerCase().includes(q) ||
    row.original.author.toLowerCase().includes(q)
  );
};

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(0);
  if (current > 2) pages.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) add(i);
  if (current < total - 3) pages.push("…");
  add(total - 1);
  return pages;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BlogStatus, { cls: string; icon: React.ReactNode }> = {
  Public: {
    cls: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    icon: <Globe className="w-2.5 h-2.5" />,
  },
  Scheduled: {
    cls: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
    icon: <Clock className="w-2.5 h-2.5" />,
  },
  Draft: {
    cls: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    icon: <FileText className="w-2.5 h-2.5" />,
  },
  Private: {
    cls: "bg-muted text-muted-foreground border border-border",
    icon: null,
  },
};

function StatusBadge({ status }: { status: BlogStatus }) {
  const { cls, icon } = STATUS_CONFIG[status] ?? STATUS_CONFIG.Draft;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-full tracking-wide ${cls}`}>
      {icon}
      {status}
    </span>
  );
}

// ─── Tab strip ────────────────────────────────────────────────────────────────

type TabKey = "all" | "Public" | "Scheduled" | "Draft";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All", icon: <BookOpen className="w-3 h-3" /> },
  { key: "Public", label: "Published", icon: <Globe className="w-3 h-3" /> },
  { key: "Scheduled", label: "Scheduled", icon: <Clock className="w-3 h-3" /> },
  { key: "Draft", label: "Drafts", icon: <FileText className="w-3 h-3" /> },
];

// ─── Filter state ─────────────────────────────────────────────────────────────

interface BlogFilters {
  dateFrom: string;
  dateTo: string;
  dateField: "all" | "createdAt" | "publishedAt";
  status: "all" | BlogStatus;
  author: string;
}

const DEFAULT_FILTERS: BlogFilters = {
  dateFrom: "", dateTo: "", dateField: "all", status: "all", author: "all",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BlogView() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<CmsBlog[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [deletingBlog, setDeletingBlog] = useState<CmsBlog | null>(null);
  const [filterDraft, setFilterDraft] = useState<BlogFilters>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState<BlogFilters>(DEFAULT_FILTERS);
  const isLoaded = usePageLoad(700);

  const fetchBlogs = useCallback(() => {
    setIsFetching(true);
    cmsBlogs
      .list()
      .then((data) => {
        setBlogs(
          data.map((b) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            author: b.author ?? "—",
            status: deriveStatus(b.published, b.publishedAt),
            createdAt: formatDate(b.createdAt),
            publishedAt: formatDate(b.publishedAt),
          })),
        );
      })
      .catch(() => setBlogs([]))
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  // Lock outer scroll while table is mounted
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(blogs.map((b) => b.author))).sort(),
    [blogs],
  );

  const tabCounts = useMemo(() => ({
    all: blogs.length,
    Public: blogs.filter((b) => b.status === "Public").length,
    Scheduled: blogs.filter((b) => b.status === "Scheduled").length,
    Draft: blogs.filter((b) => b.status === "Draft").length,
  }), [blogs]);

  const hasActiveFilters = useMemo(
    () => JSON.stringify(activeFilters) !== JSON.stringify(DEFAULT_FILTERS),
    [activeFilters],
  );

  const panelFilteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Tab filter
      if (activeTab !== "all" && blog.status !== activeTab) return false;
      // Panel filters
      if (activeFilters.status !== "all" && blog.status !== activeFilters.status) return false;
      if (activeFilters.author !== "all" && blog.author !== activeFilters.author) return false;
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        const from = activeFilters.dateFrom ? parseMDY(activeFilters.dateFrom) : null;
        const to = activeFilters.dateTo ? parseMDY(activeFilters.dateTo) : null;
        const inRange = (dateStr: string) => {
          const d = parseMDY(dateStr);
          if (!d) return true;
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        };
        if (activeFilters.dateField === "createdAt" && !inRange(blog.createdAt)) return false;
        if (activeFilters.dateField === "publishedAt" && !inRange(blog.publishedAt)) return false;
        if (activeFilters.dateField === "all" && !inRange(blog.createdAt) && !inRange(blog.publishedAt)) return false;
      }
      return true;
    });
  }, [blogs, activeTab, activeFilters]);

  const handleEditBlog = (blog: CmsBlog) => router.push(`/cms/blogs/${blog.id}/edit`);

  const handleDuplicate = useCallback((blog: CmsBlog) => {
    cmsBlogs
      .get(blog.id)
      .then((detail) =>
        cmsBlogs.create({
          title: `${detail.title} (Copy)`,
          slug: `${detail.slug}-copy-${Date.now()}`,
          body: detail.body ?? undefined,
          excerpt: detail.excerpt ?? undefined,
          coverImage: detail.coverImage ?? undefined,
          tags: detail.tags,
          author: detail.author ?? undefined,
          category: detail.category ?? undefined,
          seoTitle: detail.seoTitle ?? undefined,
          metaDesc: detail.metaDesc ?? undefined,
          keywords: detail.keywords ?? undefined,
          published: false,
          visibility: detail.visibility,
          allowComments: detail.allowComments,
          isFeatured: detail.isFeatured,
          pinToTop: detail.pinToTop,
        }),
      )
      .then((created) => {
        setBlogs((prev) => [
          {
            id: created.id,
            title: created.title,
            slug: created.slug,
            author: created.author ?? "—",
            status: deriveStatus(created.published, created.publishedAt),
            createdAt: formatDate(created.createdAt),
            publishedAt: formatDate(created.publishedAt),
          },
          ...prev,
        ]);
      })
      .catch(() => { });
  }, []);

  const columns = useMemo(
    () => [
      // ── Checkbox ──────────────────────────────────────────────────────────
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
                if (el) el.indeterminate = !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected();
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

      // ── Title + cover thumbnail ────────────────────────────────────────────
      columnHelper.accessor("title", {
        header: "Post",
        size: 340,
        cell: ({ row, getValue }) => {
          const blog = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-11 h-8 rounded-md bg-muted shrink-0 overflow-hidden border border-border/50">
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground/30" />
                </div>
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => handleEditBlog(blog)}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left truncate block max-w-[240px]"
                >
                  {getValue()}
                </button>
                <span className="text-[10px] text-muted-foreground font-mono truncate block">/blog/{blog.slug}</span>
              </div>
            </div>
          );
        },
      }),

      // ── Author ────────────────────────────────────────────────────────────
      columnHelper.accessor("author", {
        header: "Author",
        size: 140,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue()}</span>
        ),
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
        size: 130,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue()}</span>
        ),
      }),

      // ── Published on ──────────────────────────────────────────────────────
      columnHelper.accessor("publishedAt", {
        header: "Published On",
        size: 140,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue()}</span>
        ),
      }),

      // ── Actions ───────────────────────────────────────────────────────────
      columnHelper.display({
        id: "actions",
        header: "Action",
        size: 80,
        enableSorting: false,
        cell: ({ row }) => {
          const blog = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                items={[
                  {
                    label: "Edit",
                    icon: <PencilLine size={13} className="stroke-[2.5]" />,
                    onClick: () => handleEditBlog(blog),
                  },
                  {
                    label: "Preview",
                    icon: <Eye size={13} />,
                    onClick: () => window.open(`/blog/${blog.slug}`, "_blank"),
                  },
                  {
                    label: "Duplicate",
                    icon: <Copy size={13} />,
                    onClick: () => handleDuplicate(blog),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 size={13} />,
                    onClick: () => setDeletingBlog(blog),
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
    [handleDuplicate],
  );

  const table = useReactTable({
    data: panelFilteredBlogs,
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
    if (!deletingBlog) return;
    const id = deletingBlog.id;
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    setDeletingBlog(null);
    cmsBlogs.delete(id).catch(() => fetchBlogs());
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded || isFetching ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
          <TableSkeleton columns={SKELETON_COLUMNS} rows={8} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionTitle
              title={t("blog", { defaultValue: "Blog" })}
              paragraph={`${filteredCount} ${filteredCount === 1 ? "post" : "posts"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
              mb="0"
              className="!w-auto"
            />

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Refresh */}
              <button
                onClick={fetchBlogs}
                className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>

              {/* Filters */}
              <FilterPanel
                title={t("choosefilters", { defaultValue: "Choose Filters" })}
                hasActiveFilters={hasActiveFilters}
                onSearch={() => setActiveFilters({ ...filterDraft })}
                onClear={() => { setFilterDraft(DEFAULT_FILTERS); setActiveFilters(DEFAULT_FILTERS); }}
                trigger={
                  <button className="inline-flex items-center gap-2 rounded-sm bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-all cursor-pointer active:scale-[0.98]">
                    <ListFilterPlus size={15} />
                    Filters
                  </button>
                }
              >
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Duration</p>
                  <DateRangePicker
                    startDate={filterDraft.dateFrom}
                    endDate={filterDraft.dateTo}
                    onChange={(start, end) => setFilterDraft((f) => ({ ...f, dateFrom: start, dateTo: end }))}
                  />
                </div>
                <FilterSelect
                  label="Date Filter On"
                  value={filterDraft.dateField}
                  onChange={(v) => setFilterDraft((f) => ({ ...f, dateField: v as BlogFilters["dateField"] }))}
                  options={[
                    { value: "all", label: "All" },
                    { value: "createdAt", label: "Created" },
                    { value: "publishedAt", label: "Published On" },
                  ]}
                />
                <FilterSelect
                  label="Status"
                  value={filterDraft.status}
                  onChange={(v) => setFilterDraft((f) => ({ ...f, status: v as BlogFilters["status"] }))}
                  options={[
                    { value: "all", label: "All" },
                    { value: "Public", label: "Published" },
                    { value: "Scheduled", label: "Scheduled" },
                    { value: "Draft", label: "Draft" },
                  ]}
                />
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
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts…"
                  className="pl-9 pr-8 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all w-48"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* New post */}
              <button
                onClick={() => router.push("/cms/blogs/new")}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] group"
              >
                <Plus size={15} className="stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
                New Post
              </button>
            </div>
          </div>

          {/* ── Status tabs ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 mt-5 border-b border-border">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                    {tabCounts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Table ───────────────────────────────────────────────────────── */}
          <div className="mt-4 bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
              <table
                className="text-left border-collapse"
                style={{ tableLayout: "fixed", width: "100%", minWidth: "980px" }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="text-[12px] font-semibold text-muted-foreground select-none">
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const isActions = header.id === "actions";
                        const isSelect = header.id === "select";
                        return (
                          <th
                            key={header.id}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                            style={{ width: header.getSize() }}
                            className={`sticky top-0 z-10 bg-muted/80 backdrop-blur-sm font-semibold py-3.5 px-4 border-b border-border ${isActions ? "text-right" : ""} ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                          >
                            <div className={`flex items-center gap-1 ${isActions ? "justify-end" : isSelect ? "justify-center" : ""}`}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              {canSort && (
                                sorted === "asc" ? <ChevronUp size={12} className="text-primary shrink-0" />
                                  : sorted === "desc" ? <ChevronDown size={12} className="text-primary shrink-0" />
                                    : <ChevronsUpDown size={12} className="text-muted-foreground/40 shrink-0" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody className="divide-y divide-border text-[13px]">
                  <AnimatePresence initial={false}>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <motion.tr
                          key={row.id}
                          layoutId={`blog-row-${row.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-muted/40 transition-colors ${row.getIsSelected() ? "bg-primary/5" : ""}`}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const id = cell.column.id;
                            const tdCls =
                              id === "select" ? "py-3 px-4"
                                : id === "actions" ? "py-3 px-4 text-right"
                                  : "py-3 px-4";
                            return (
                              <td key={cell.id} className={tdCls} style={{ width: cell.column.getSize() }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">No posts found</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {searchTerm || hasActiveFilters || activeTab !== "all"
                                  ? "Try adjusting your search or filters."
                                  : "Get started by writing your first blog post."}
                              </p>
                            </div>
                            {!searchTerm && !hasActiveFilters && activeTab === "all" && (
                              <button
                                onClick={() => router.push("/cms/blogs/new")}
                                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
                              >
                                Write first post
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <div className="px-5 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="px-2 py-1 bg-background border border-border rounded-sm text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {fromEntry}–{toEntry} of {filteredCount}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Prev
                  </button>
                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? (
                      <span key={`e-${idx}`} className="w-7 text-center text-muted-foreground text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => table.setPageIndex(p)}
                        className={`w-7 h-7 text-xs font-semibold rounded-sm transition-all ${pageIndex === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        {(p as number) + 1}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Delete modal ─────────────────────────────────────────────────── */}
          <Modal
            isOpen={!!deletingBlog}
            onClose={() => setDeletingBlog(null)}
            title={t("deleteblogpost", { defaultValue: "Delete Blog Post?" })}
            description={
              <>
                Are you sure you want to delete{" "}
                <strong className="text-foreground">&ldquo;{deletingBlog?.title}&rdquo;</strong>?
                This action cannot be undone.
              </>
            }
            icon={<HelpCircle size={20} />}
            iconVariant="danger"
            maxWidth="md"
            footer={
              <>
                <button
                  type="button"
                  onClick={() => setDeletingBlog(null)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-sm text-sm font-semibold transition-all active:scale-95"
                >
                  Yes, Delete
                </button>
              </>
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
