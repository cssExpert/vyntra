"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Plus,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  FolderOpen,
  Folder,
  Search,
  AlertTriangle,
  Layers,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getTreeFromFlatData,
  getVisibleNodeCount,
} from "@nosferatu500/react-sortable-tree";
import type { TreeItem } from "@nosferatu500/react-sortable-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeCategories, type ApiProductCategory } from "@/lib/api";
import type { StoreCategory } from "../store.types";

const SortableTree = dynamic(
  () =>
    import("@nosferatu500/react-sortable-tree").then((m) => ({
      default: m.SortableTree,
    })),
  { ssr: false },
);

type CatTreeItem = TreeItem & StoreCategory;

// ─── Data helpers ─────────────────────────────────────────────────────────────

function mapApiCategory(c: ApiProductCategory): StoreCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ?? undefined,
    description: c.description ?? undefined,
    imageUrl: c.imageUrl ?? undefined,
    status: (c.status === "active" ? "active" : "inactive") as "active" | "inactive",
    featured: c.featured ?? false,
    sortOrder: c.sortOrder,
    productCount: 0,
    seoTitle: c.seoTitle ?? undefined,
    seoDescription: c.seoDescription ?? undefined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function toTree(flat: StoreCategory[]): CatTreeItem[] {
  return getTreeFromFlatData({
    flatData: flat.map((c) => ({
      ...c,
      title: c.name,
      expanded: !c.parentId,
    })),
    getKey: (n) => n.id,
    getParentKey: (n) => n.parentId ?? "null-root",
    rootKey: "null-root",
  }) as CatTreeItem[];
}

function flattenTreeOrder(
  nodes: TreeItem[],
  parentId: string | null = null,
): Array<{ id: string; parentId: string | null }> {
  const result: Array<{ id: string; parentId: string | null }> = [];
  nodes.forEach((node) => {
    result.push({ id: (node as CatTreeItem).id, parentId });
    if (node.children && (node.children as TreeItem[]).length > 0) {
      result.push(
        ...flattenTreeOrder(
          node.children as TreeItem[],
          (node as CatTreeItem).id,
        ),
      );
    }
  });
  return result;
}

function getCategoryPath(id: string, cats: StoreCategory[]): string {
  const cat = cats.find((c) => c.id === id);
  if (!cat) return "";
  if (!cat.parentId) return cat.name;
  return `${getCategoryPath(cat.parentId, cats)} → ${cat.name}`;
}

const ROW_HEIGHT = 48;

// ─── DeleteModal ──────────────────────────────────────────────────────────────

function DeleteModal({
  category,
  onConfirm,
  onCancel,
}: {
  category: StoreCategory;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 bg-card rounded-xl border border-border shadow-2xl p-6 w-full max-w-sm mx-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-destructive" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Delete Category
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{category.name}</span>
          ?
          {category.productCount > 0 && (
            <>
              {" "}
              This category has{" "}
              <span className="font-semibold text-destructive">
                {category.productCount} products
              </span>{" "}
              assigned to it.
            </>
          )}{" "}
          This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-sm hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-sm hover:bg-destructive/90 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── CatNodeRenderer ──────────────────────────────────────────────────────────

function CatNodeRenderer(props: Record<string, unknown>) {
  const {
    node,
    path,
    treeIndex,
    connectDragSource,
    connectDragPreview,
    toggleChildrenVisibility,
    isDragging,
    onEdit,
    onDelete,
    totalVisible,
  } = props as {
    node: CatTreeItem;
    path: number[];
    treeIndex: number;
    connectDragSource: React.Ref<HTMLDivElement>;
    connectDragPreview: React.Ref<HTMLDivElement>;
    toggleChildrenVisibility?: (p: {
      node: TreeItem;
      path: number[];
      treeIndex: number;
    }) => void;
    isDragging: boolean;
    onEdit: (id: string) => void;
    onDelete: (cat: StoreCategory) => void;
    totalVisible: number;
  };

  const t = useTranslations("store.categories");
  const [isHovered, setIsHovered] = useState(false);
  const isLast = treeIndex === totalVisible - 1;
  const hasChildren =
    Array.isArray(node.children) && (node.children as TreeItem[]).length > 0;
  const depth = path.length - 1;

  return (
    <div
      ref={connectDragPreview}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-stretch h-full bg-card transition-colors select-none",
        isLast && "cat-row-last",
        isDragging && "opacity-30",
      )}
    >
      {/* Drag handle */}
      <div
        ref={connectDragSource}
        className="drag-handle w-12 shrink-0 flex items-center justify-center bg-muted/50 border-r border-border cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={15} className="text-muted-foreground/60" />
      </div>

      {/* Expand/collapse toggle */}
      <div className="w-8 shrink-0 flex items-center justify-center">
        {toggleChildrenVisibility && hasChildren ? (
          <button
            type="button"
            onClick={() => toggleChildrenVisibility({ node, path, treeIndex })}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {node.expanded ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
      </div>

      {/* Folder icon */}
      <div className="flex items-center px-2 shrink-0">
        <div
          className={cn(
            "h-6 w-6 rounded-sm flex items-center justify-center",
            depth === 0 ? "bg-primary/15" : "bg-primary/8",
          )}
        >
          {hasChildren && node.expanded ? (
            <FolderOpen size={13} className="text-primary" />
          ) : (
            <Folder
              size={13}
              className={hasChildren ? "text-primary" : "text-primary/70"}
            />
          )}
        </div>
      </div>

      {/* Name + slug + meta */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "text-[14px] text-foreground truncate",
            depth === 0 ? "font-semibold" : "font-medium",
          )}
        >
          {node.name}
        </span>
        <span className="text-[11px] text-muted-foreground font-mono shrink-0 hidden sm:inline">
          /{node.slug}
        </span>
        <div className="items-center gap-2 hidden md:inline-flex">
          <span className="text-xs text-muted-foreground tabular-nums border-l border-border ml-2 pl-2">
            {node.productCount} {t("products")}
          </span>
          <StatusBadge
            variant={node.status === "active" ? "success" : "muted"}
            label={t(
              node.status === "active" ? "statusActive" : "statusInactive",
            )}
            size="sm"
          />
        </div>
      </div>

      {/* Hover actions */}
      <div className="relative flex items-center px-4 shrink-0">
        <div
          className={cn(
            "absolute right-4 bg-card flex items-center gap-1.5 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <button
            type="button"
            title={t("edit")}
            onClick={() => onEdit(node.id)}
            className="p-1.5 rounded-md text-teal-500 hover:bg-teal-500/10 transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            title={t("delete")}
            onClick={() => onDelete(node)}
            className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CategoriesView ───────────────────────────────────────────────────────────

export function CategoriesView() {
  const t = useTranslations("store.categories");
  const isLoaded = usePageLoad(600);
  const router = useRouter();

  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [allCats, setAllCats] = useState<StoreCategory[]>([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StoreCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeCategories.list({ take: 500 });
      const cats = res.data.map(mapApiCategory);
      setAllCats(cats);
      setTreeData(toTree(cats));
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // null = show tree; array = show flat search results
  const filteredCats = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allCats.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [search, allCats]);

  const handleEdit = useCallback(
    (id: string) => router.push(`/store/categories/${id}/edit`),
    [router],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await storeCategories.remove(deleteTarget.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteTarget(null);
    reload();
  }, [deleteTarget, reload]);

  const handleTreeChange = useCallback(
    (newTree: TreeItem[]) => {
      if (search.trim()) return;
      setTreeData(newTree);
    },
    [search],
  );

  const displayTree = filteredCats ? toTree(filteredCats) : treeData;
  const totalVisible = getVisibleNodeCount({ treeData: displayTree });
  const treeHeight = Math.max(1, totalVisible) * ROW_HEIGHT;

  const generateNodeProps = useCallback(
    () => ({ onEdit: handleEdit, onDelete: setDeleteTarget, totalVisible }),
    [handleEdit, totalVisible],
  );

  const totalCats = allCats.length;
  const activeCats = allCats.filter((c) => c.status === "active").length;
  const inactiveCats = totalCats - activeCats;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {!isLoaded || isLoading ? (
          <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
            <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
            <div className="h-72 w-full rounded-xl bg-muted animate-pulse" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <PageHeader
              title={t("title")}
              description={`${totalCats} ${t("title").toLowerCase()} · ${t("dragToReorder")}`}
              breadcrumbs={[
                { label: t("store"), href: "/store" },
                { label: t("title") },
              ]}
            >
              <Button
                size="lg"
                radius="sm"
                className="px-4"
                onClick={() => router.push("/store/categories/add")}
              >
                <Plus
                  size={16}
                  className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
                />
                {t("addCategory")}
              </Button>
            </PageHeader>

            {/* Stats chips */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Total",
                  value: totalCats,
                  Icon: Layers,
                  color: "text-primary",
                },
                {
                  label: t("statusActive"),
                  value: activeCats,
                  Icon: Tag,
                  color: "text-success",
                },
                {
                  label: t("statusInactive"),
                  value: inactiveCats,
                  Icon: Tag,
                  color: "text-muted-foreground",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="glass-card p-3 flex items-center gap-3"
                >
                  <s.Icon size={15} className={s.color} />
                  <div>
                    <p className={`text-lg font-extrabold ${s.color}`}>
                      {s.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Search size={17} />
              </span>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                size="lg"
                className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
              />
            </div>

            {/* Tree / search results */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-5">
              {filteredCats !== null ? (
                filteredCats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                    <Search size={32} className="opacity-25" />
                    <p className="text-sm">{t("noCategoriesFound")}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredCats.map((cat) => (
                      <div
                        key={cat.id}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div
                          className={cn(
                            "h-6 w-6 rounded-sm flex items-center justify-center shrink-0",
                            !cat.parentId ? "bg-primary/15" : "bg-primary/8",
                          )}
                        >
                          <Folder size={13} className="text-primary/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-foreground truncate">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {getCategoryPath(cat.id, allCats)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block tabular-nums shrink-0">
                          {cat.productCount} {t("products")}
                        </span>
                        <StatusBadge
                          variant={
                            cat.status === "active" ? "success" : "muted"
                          }
                          label={t(
                            cat.status === "active"
                              ? "statusActive"
                              : "statusInactive",
                          )}
                          size="sm"
                        />
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEdit(cat.id)}
                            className="p-1.5 rounded-md text-teal-500 hover:bg-teal-500/10 transition-colors cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-2.5 md:p-5">
                  <SortableTree
                    treeData={displayTree}
                    onChange={handleTreeChange}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    nodeContentRenderer={CatNodeRenderer as React.ComponentType<any>}
                    generateNodeProps={generateNodeProps}
                    getNodeKey={({ node }) =>
                      String((node as CatTreeItem).id)
                    }
                    scaffoldBlockPxWidth={38}
                    maxDepth={8}
                    rowHeight={ROW_HEIGHT}
                    style={{
                      height: treeHeight,
                      maxHeight: "calc(100vh - 380px)",
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            category={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
