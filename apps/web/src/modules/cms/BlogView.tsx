"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  MoreVertical,
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
import {
  INITIAL_BLOGS,
  type BlogStatus,
  type CmsBlog,
} from "@/modules/cms/blog-data";

// Skeleton column layout mirrors the real table columns below.
const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "w-12", shape: "checkbox", align: "center" },
  { width: "flex-[3]", shape: "text", cellWidth: "w-56", headerWidth: "w-10" },
  {
    width: "flex-[1.4]",
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
    width: "flex-[1.3]",
    shape: "text",
    cellWidth: "w-24",
    headerWidth: "w-14",
  },
  {
    width: "flex-[1.4]",
    shape: "text",
    cellWidth: "w-24",
    headerWidth: "w-24",
  },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

// ─── Module-level TanStack helpers ───────────────────────────────────────────

const columnHelper = createColumnHelper<CmsBlog>();

const titleAuthorFilter: FilterFn<CmsBlog> = (
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

function StatusBadge({ status }: { status: BlogStatus }) {
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

interface BlogFilters {
  dateFrom: string;
  dateTo: string;
  dateField: "all" | "createdAt" | "publishedAt";
  status: "all" | BlogStatus;
  author: string;
}

const DEFAULT_FILTERS: BlogFilters = {
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

export function BlogView() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<CmsBlog[]>(INITIAL_BLOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deletingBlog, setDeletingBlog] = useState<CmsBlog | null>(null);
  const [filterDraft, setFilterDraft] = useState<BlogFilters>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] =
    useState<BlogFilters>(DEFAULT_FILTERS);
  const isLoaded = usePageLoad(700);

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(blogs.map((b) => b.author))).sort(),
    [blogs],
  );

  const hasActiveFilters = useMemo(
    () => JSON.stringify(activeFilters) !== JSON.stringify(DEFAULT_FILTERS),
    [activeFilters],
  );

  const panelFilteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      if (
        activeFilters.status !== "all" &&
        blog.status !== activeFilters.status
      )
        return false;
      if (
        activeFilters.author !== "all" &&
        blog.author !== activeFilters.author
      )
        return false;
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        const from = activeFilters.dateFrom
          ? new Date(activeFilters.dateFrom)
          : null;
        const to = activeFilters.dateTo ? new Date(activeFilters.dateTo) : null;
        const inRange = (dateStr: string) => {
          const d = parseMDY(dateStr);
          if (!d) return true;
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        };
        if (activeFilters.dateField === "createdAt" && !inRange(blog.createdAt))
          return false;
        if (
          activeFilters.dateField === "publishedAt" &&
          !inRange(blog.publishedAt)
        )
          return false;
        if (
          activeFilters.dateField === "all" &&
          !inRange(blog.createdAt) &&
          !inRange(blog.publishedAt)
        )
          return false;
      }
      return true;
    });
  }, [blogs, activeFilters]);

  const handleEditBlogClick = (blog: CmsBlog) => {
    router.push(`/cms/blogs/${blog.id}/edit`);
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
        size: 320,
        cell: ({ row, getValue }) => {
          const blog = row.original;
          return (
            <button
              type="button"
              onClick={() => handleEditBlogClick(blog)}
              className="text-primary font-semibold cursor-pointer hover:underline underline-offset-2 text-left"
            >
              {getValue()}
            </button>
          );
        },
      }),

      // ── Author ────────────────────────────────────────────────────────────
      columnHelper.accessor("author", {
        header: "Author",
        size: 150,
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

      // ── Published on ──────────────────────────────────────────────────────
      columnHelper.accessor("publishedAt", {
        header: "Published on",
        size: 150,
        cell: ({ getValue }) => getValue(),
      }),

      // ── Actions ───────────────────────────────────────────────────────────
      columnHelper.display({
        id: "actions",
        header: "Action",
        size: 90,
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
                    onClick: () => handleEditBlogClick(blog),
                  },
                  {
                    label: "Preview",
                    icon: <Eye size={13} />,
                    onClick: () => window.open(`/blog/${blog.slug}`, "_blank"),
                  },
                  {
                    label: "Duplicate",
                    icon: <Copy size={13} />,
                    onClick: () => {
                      const today = todayFormatted();
                      setBlogs((prev) => [
                        ...prev,
                        {
                          ...blog,
                          id: Date.now().toString(),
                          title: `${blog.title} (Copy)`,
                          slug: `${blog.slug}-copy-${Date.now()}`,
                          status: "Draft",
                          createdAt: today,
                          publishedAt: today,
                        },
                      ]);
                    },
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
    [],
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
    setBlogs((prev) => prev.filter((b) => b.id !== deletingBlog.id));
    setDeletingBlog(null);
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();
  const selectedCount = Object.keys(rowSelection).length;

  const handleAddBlogClick = () => {
    router.push("/cms/blogs/new");
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
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
              title="Blog"
              paragraph={`${filteredCount} ${filteredCount === 1 ? "post" : "posts"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
              mb="0"
              className="!w-auto"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBlogClick}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <Plus
                  size={16}
                  className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
                />
                Add Blog
              </button>
              <button className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all cursor-pointer active:scale-[0.98]">
                <Download size={15} />
                Export
              </button>
              <button className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-2.5 py-2.5 text-foreground hover:bg-muted transition-all cursor-pointer active:scale-[0.98]">
                <MoreVertical size={15} />
              </button>

              {/* Apply Filters */}
              <FilterPanel
                title="Choose Filters"
                hasActiveFilters={hasActiveFilters}
                onSearch={() => setActiveFilters({ ...filterDraft })}
                onClear={() => {
                  setFilterDraft(DEFAULT_FILTERS);
                  setActiveFilters(DEFAULT_FILTERS);
                }}
                trigger={
                  <button className="inline-flex items-center gap-2 rounded-sm bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-all cursor-pointer active:scale-[0.98]">
                    <ListFilterPlus size={15} />
                    Apply Filters
                  </button>
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
                      dateField: v as BlogFilters["dateField"],
                    }))
                  }
                  options={[
                    { value: "all", label: "All" },
                    { value: "createdAt", label: "Created" },
                    { value: "publishedAt", label: "Published On" },
                  ]}
                />

                {/* Status */}
                <FilterSelect
                  label="Status"
                  value={filterDraft.status}
                  onChange={(v) =>
                    setFilterDraft((f) => ({
                      ...f,
                      status: v as BlogFilters["status"],
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
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blog posts..."
                  className="pl-9 pr-8 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all w-52"
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

          {/* ── Table Card ─────────────────────────────────────────────────── */}
          <div className="mt-6 bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 270px)" }}
            >
              <table
                className="text-left border-collapse"
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  minWidth: "1010px",
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
                          layoutId={`blog-row-${row.id}`}
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
                            No blog posts found
                          </p>
                          <p className="text-xs">
                            Try adjusting your search or add a new blog post.
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
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1.5 text-sm font-medium rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>

                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 text-center text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => table.setPageIndex(p)}
                        className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all ${
                          pageIndex === p
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {p + 1}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1.5 text-sm font-medium rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Delete confirmation modal ───────────────────────────────────── */}
          <Modal
            isOpen={!!deletingBlog}
            onClose={() => setDeletingBlog(null)}
            title="Delete Blog Post?"
            description={
              <>
                Are you sure you want to delete{" "}
                <strong className="text-foreground font-bold">
                  &ldquo;{deletingBlog?.title}&rdquo;
                </strong>
                ? This action cannot be undone.
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
