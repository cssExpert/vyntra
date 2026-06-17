"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
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
  Eye,
  Pencil,
  Trash2,
  FolderOpen,
  Folder,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getTreeFromFlatData,
  getVisibleNodeCount,
} from "@nosferatu500/react-sortable-tree";
import type { TreeItem } from "@nosferatu500/react-sortable-tree";
import { Button } from "@/components/ui/button";

const SortableTree = dynamic(
  () =>
    import("@nosferatu500/react-sortable-tree").then((m) => ({
      default: m.SortableTree,
    })),
  { ssr: false },
);

interface FlatCat {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  status: "active" | "inactive";
}

type CatTreeItem = TreeItem & FlatCat;

const INIT: FlatCat[] = [
  {
    id: "c1",
    name: "Templates",
    slug: "templates",
    parentId: null,
    productCount: 18,
    status: "active",
  },
  {
    id: "c2",
    name: "Subscriptions",
    slug: "subscriptions",
    parentId: null,
    productCount: 4,
    status: "active",
  },
  {
    id: "c3",
    name: "Digital Downloads",
    slug: "digital-downloads",
    parentId: null,
    productCount: 32,
    status: "active",
  },
  {
    id: "c4",
    name: "Merchandise",
    slug: "merchandise",
    parentId: null,
    productCount: 11,
    status: "active",
  },
  {
    id: "c5",
    name: "Services",
    slug: "services",
    parentId: null,
    productCount: 6,
    status: "inactive",
  },
  {
    id: "c1a",
    name: "UI Kits",
    slug: "ui-kits",
    parentId: "c1",
    productCount: 7,
    status: "active",
  },
  {
    id: "c1b",
    name: "Icon Packs",
    slug: "icon-packs",
    parentId: "c1",
    productCount: 5,
    status: "active",
  },
  {
    id: "c1c",
    name: "Dashboard Templates",
    slug: "dashboard-templates",
    parentId: "c1",
    productCount: 6,
    status: "active",
  },
  {
    id: "c3a",
    name: "E-books",
    slug: "ebooks",
    parentId: "c3",
    productCount: 12,
    status: "active",
  },
  {
    id: "c3b",
    name: "Code Snippets",
    slug: "code-snippets",
    parentId: "c3",
    productCount: 8,
    status: "inactive",
  },
  {
    id: "c1a1",
    name: "React UI Kits",
    slug: "react-ui-kits",
    parentId: "c1a",
    productCount: 4,
    status: "active",
  },
  {
    id: "c1a2",
    name: "Figma Kits",
    slug: "figma-kits",
    parentId: "c1a",
    productCount: 3,
    status: "active",
  },
];

const INITIALLY_EXPANDED = new Set(["c1", "c3", "c1a"]);

function toTree(flat: FlatCat[]): CatTreeItem[] {
  return getTreeFromFlatData({
    flatData: flat.map((c) => ({
      ...c,
      title: c.name,
      expanded: INITIALLY_EXPANDED.has(c.id),
    })),
    getKey: (n) => n.id,
    getParentKey: (n) => n.parentId ?? "null-root",
    rootKey: "null-root",
  }) as CatTreeItem[];
}

const ROW_HEIGHT = 48;

// Defined at module scope — never re-creates on re-render, avoiding subtree remounts
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
      {/* drag handle */}
      <div
        ref={connectDragSource}
        className="relative drag-handle w-12 shrink-0 flex items-center justify-center bg-muted/50 border-r border-border cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={15} className="text-muted-foreground/60" />
      </div>

      {/* expand / collapse toggle */}
      <div className="w-8 shrink-0 flex items-center justify-center arrow-container">
        {toggleChildrenVisibility && hasChildren ? (
          <button
            type="button"
            onClick={() => toggleChildrenVisibility({ node, path, treeIndex })}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {hasChildren ? (
              node.expanded ? (
                <ChevronDown size={13} />
              ) : (
                <ChevronRight size={13} />
              )
            ) : (
              <span className="w-[13px]" /> // Keeps alignment for childless items
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
      </div>

      {/* folder icon */}
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

      {/* name + slug */}
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
            label={t(node.status === "active" ? "statusActive" : "statusInactive")}
            size="sm"
          />
        </div>
      </div>

      {/* product count + status + hover actions */}
      <div className="relative flex items-center gap-3 px-4 shrink-0">
        <div
          className={cn(
            "absolute right-4 bg-card flex items-center gap-1.5 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <button
            type="button"
            title={t("view")}
            className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Eye size={14} />
          </button>
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
            className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoriesView() {
  const t = useTranslations("store.categories");
  const isLoaded = usePageLoad(600);
  const router = useRouter();
  const [treeData, setTreeData] = useState<TreeItem[]>(() => toTree(INIT));

  const handleEdit = useCallback(
    (id: string) => router.push(`/store/categories/${id}/edit`),
    [router],
  );

  const totalVisible = getVisibleNodeCount({ treeData });

  const generateNodeProps = useCallback(
    () => ({ onEdit: handleEdit, totalVisible }),
    [handleEdit, totalVisible],
  );

  const treeHeight = Math.max(1, totalVisible) * ROW_HEIGHT;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
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
            description={`${INIT.length} ${t("products")} · ${t("dragToReorder")}`}
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

          <div className="bg-card rounded-xl border border-border shadow-sm p-2.5 md:p-5 overflow-hidden mb-5">
            <SortableTree
              treeData={treeData}
              onChange={setTreeData}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeContentRenderer={CatNodeRenderer as React.ComponentType<any>}
              generateNodeProps={generateNodeProps}
              getNodeKey={({ node }) => String((node as CatTreeItem).id)}
              scaffoldBlockPxWidth={38}
              maxDepth={8}
              rowHeight={ROW_HEIGHT}
              style={{
                height: treeHeight,
                maxHeight: "calc(100vh - 265px)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
