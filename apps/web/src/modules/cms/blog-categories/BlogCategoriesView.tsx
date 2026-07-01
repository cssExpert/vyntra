"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
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
  type PaginationState,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Tag,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Modal } from "@/components/common/Modal";
import {
  TableSkeleton,
  type TableSkeletonColumn,
} from "@/components/common/TableSkeleton";
import { usePageLoad } from "@/hooks/usePageLoad";
import { cmsBlogCategories, type CmsBlogCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getFullYear()}`;
}

// ─── Table setup ─────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<CmsBlogCategory>();

const nameFilter: FilterFn<CmsBlogCategory> = (row, _id, filterValue: string) =>
  row.original.name.toLowerCase().includes(filterValue.toLowerCase()) ||
  row.original.slug.toLowerCase().includes(filterValue.toLowerCase());

const SKELETON_COLUMNS: TableSkeletonColumn[] = [
  { width: "flex-[3]", shape: "text", cellWidth: "w-40", headerWidth: "w-12" },
  { width: "flex-[2]", shape: "text", cellWidth: "w-32", headerWidth: "w-10" },
  { width: "flex-[3]", shape: "text", cellWidth: "w-48", headerWidth: "w-20" },
  {
    width: "flex-[1.5]",
    shape: "text",
    cellWidth: "w-24",
    headerWidth: "w-16",
  },
  { width: "w-20", shape: "actions", align: "end", headerWidth: "w-12" },
];

// ─── Category form ────────────────────────────────────────────────────────────

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
}

function emptyForm(): CategoryFormState {
  return { name: "", slug: "", description: "" };
}

function CategoryForm({
  value,
  onChange,
  slugManuallyEdited,
  setSlugManuallyEdited,
  error,
}: {
  value: CategoryFormState;
  onChange: (v: CategoryFormState) => void;
  slugManuallyEdited: boolean;
  setSlugManuallyEdited: (v: boolean) => void;
  error?: string;
}) {
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5";

  return (
    <div className="p-5 space-y-4">
      {error && (
        <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}
      <div>
        <label className={labelCls}>
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          type="text"
          value={value.name}
          onChange={(e) => {
            const name = e.target.value;
            onChange({
              ...value,
              name,
              slug: slugManuallyEdited ? value.slug : slugify(name),
            });
          }}
          placeholder="e.g. Tutorials"
          className={inputCls}
          autoFocus
        />
      </div>
      <div>
        <label className={labelCls}>
          Slug <span className="text-destructive">*</span>
        </label>
        <Input
          type="text"
          value={value.slug}
          onChange={(e) => {
            setSlugManuallyEdited(true);
            onChange({ ...value, slug: e.target.value });
          }}
          placeholder="e.g. tutorials"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          rows={3}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="Optional short description of this category…"
          className={inputCls}
        />
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function BlogCategoriesView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.blog-categories");
  const [categories, setCategories] = useState<CmsBlogCategory[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<CmsBlogCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const [deletingCategory, setDeletingCategory] =
    useState<CmsBlogCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isLoaded = usePageLoad(600);

  useEffect(() => {
    cmsBlogCategories
      .list()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsFetching(false));
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setSlugManuallyEdited(false);
    setFormError(undefined);
    setEditingCategory(null);
    setModalMode("create");
  };

  const openEdit = (cat: CmsBlogCategory) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
    });
    setSlugManuallyEdited(true);
    setFormError(undefined);
    setEditingCategory(cat);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!form.slug.trim()) {
      setFormError("Slug is required");
      return;
    }
    setSaving(true);
    setFormError(undefined);
    try {
      if (modalMode === "create") {
        const created = await cmsBlogCategories.create({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
        });
        setCategories((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
      } else if (editingCategory) {
        const updated = await cmsBlogCategories.update(editingCategory.id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
        });
        setCategories((prev) =>
          prev
            .map((c) => (c.id === updated.id ? updated : c))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await cmsBlogCategories.delete(deletingCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setDeletingCategory(null);
    } catch {
      // keep modal open on failure
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        size: 200,
        cell: ({ getValue }) => (
          <span className="font-semibold text-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("slug", {
        header: "Slug",
        size: 160,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            /{getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        size: 260,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground truncate block max-w-[240px]">
            {getValue() ?? <span className="italic opacity-50">—</span>}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        size: 130,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatDate(getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Action",
        size: 80,
        enableSorting: false,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                items={[
                  {
                    label: "Edit",
                    icon: <Pencil size={13} className="stroke-[2.5]" />,
                    onClick: () => openEdit(cat),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 size={13} />,
                    onClick: () => setDeletingCategory(cat),
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

    [],
  );

  const table = useReactTable({
    data: categories,
    columns,
    state: { globalFilter: searchTerm, sorting, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: nameFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = table.getPageCount();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded || isFetching ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <TableSkeleton columns={SKELETON_COLUMNS} rows={6} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionTitle
              title="Blog Categories"
              paragraph={`${filteredCount} ${filteredCount === 1 ? "category" : "categories"}`}
              mb="0"
              className="!w-auto"
            />
            <div className="flex items-center gap-2">
              <Button
                size="lg"
                radius="sm"
                className="px-4 active:scale-[0.98] group"
                onClick={openCreate}
              >
                <Plus
                  size={16}
                  className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
                />
                Add Category
              </Button>
              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search size={15} />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  size="lg"
                  className="pl-9 pr-8 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 w-52"
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

          {/* Table */}
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
                  minWidth: "760px",
                }}
              >
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
                              className={`flex items-center gap-1 ${isActions ? "justify-end" : ""}`}
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
                <tbody className="divide-y divide-border text-[14px]">
                  <AnimatePresence initial={false}>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <motion.tr
                          key={row.id}
                          layoutId={`cat-row-${row.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              style={{ width: cell.column.getSize() }}
                              className={`py-4 px-4 ${cell.column.id === "actions" ? "text-right" : ""}`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="py-14 text-center text-muted-foreground bg-muted/10"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Tag
                              size={28}
                              className="text-muted-foreground/40"
                            />
                            <p className="font-semibold text-foreground">
                              No categories yet
                            </p>
                            <p className="text-xs">
                              Create a category to start organizing your blog
                              posts.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                >
                  {[10, 25, 50].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  Showing {fromEntry} to {toEntry} of {filteredCount} entries
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    radius="sm"
                    className="h-8 px-3 text-muted-foreground"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    ← Previous
                  </Button>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <Button
                      key={i}
                      variant={pageIndex === i ? "default" : "outline"}
                      size="icon"
                      radius="sm"
                      onClick={() => table.setPageIndex(i)}
                      className={`w-8 h-8 text-sm font-semibold ${
                        pageIndex === i ? "" : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    radius="sm"
                    className="h-8 px-3 text-muted-foreground"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Create / Edit Modal */}
          <Modal
            isOpen={modalMode !== null}
            onClose={closeModal}
            title={modalMode === "create" ? "Add Category" : "Edit Category"}
            icon={<Tag size={18} />}
            maxWidth="sm"
            footer={
              <>
                <Button
                  variant="ghost"
                  radius="sm"
                  className="font-semibold text-muted-foreground hover:text-foreground"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  radius="sm"
                  onClick={handleSave}
                  loading={saving}
                  loadingText="Saving…"
                  className="px-5 font-semibold active:scale-95"
                >
                  {modalMode === "create" ? "Create" : "Save Changes"}
                </Button>
              </>
            }
          >
            <CategoryForm
              value={form}
              onChange={setForm}
              slugManuallyEdited={slugManuallyEdited}
              setSlugManuallyEdited={setSlugManuallyEdited}
              error={formError}
            />
          </Modal>

          {/* Delete Confirm Modal */}
          <Modal
            isOpen={!!deletingCategory}
            onClose={() => setDeletingCategory(null)}
            title="Delete Category?"
            description={
              <>
                Delete{" "}
                <strong className="text-foreground font-bold">
                  &ldquo;{deletingCategory?.name}&rdquo;
                </strong>
                ? Blog posts using this category will keep the value but it
                won&apos;t appear as an option.
              </>
            }
            icon={<Trash2 size={18} />}
            iconVariant="danger"
            maxWidth="md"
            footer={
              <>
                <Button
                  variant="ghost"
                  radius="sm"
                  className="font-semibold text-muted-foreground hover:text-foreground"
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  radius="sm"
                  onClick={handleDelete}
                  loading={deleting}
                  loadingText="Deleting…"
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
