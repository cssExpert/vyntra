"use client";

import { useState, useRef } from "react";
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

interface FlatCat {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  status: "active" | "inactive";
}
interface CatNode extends FlatCat {
  children: CatNode[];
}
interface Row {
  node: CatNode;
  depth: number;
  hasChildren: boolean;
}
interface DropTarget {
  afterId: string | null;
  depth: number;
}

const INDENT = 48;    // px per depth level (visual spacing)
const MAX_DEPTH = 2;
const DEPTH_ZONE = INDENT * 2; // 96 px per zone — 2× wider, far easier to target

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

function buildTree(flat: FlatCat[]): CatNode[] {
  const map = new Map<string, CatNode>(
    flat.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CatNode[] = [];
  map.forEach((n) => {
    if (n.parentId && map.has(n.parentId))
      map.get(n.parentId)!.children.push(n);
    else roots.push(n);
  });
  return roots;
}

function flatten(nodes: CatNode[], expanded: Set<string>, depth = 0): Row[] {
  return nodes.flatMap((n) => [
    { node: n, depth, hasChildren: n.children.length > 0 },
    ...(expanded.has(n.id) ? flatten(n.children, expanded, depth + 1) : []),
  ]);
}

function subtree(id: string, flat: FlatCat[]): string[] {
  const ids = [id];
  flat
    .filter((i) => i.parentId === id)
    .forEach((c) => ids.push(...subtree(c.id, flat)));
  return ids;
}

function parentForDrop(
  rows: Row[],
  afterId: string | null,
  depth: number,
): string | null {
  if (depth === 0) return null;
  const idx =
    afterId === null ? -1 : rows.findIndex((r) => r.node.id === afterId);
  for (let i = idx; i >= 0; i--) {
    if (rows[i].depth === depth - 1) return rows[i].node.id;
  }
  return null;
}

function applyDrop(
  flat: FlatCat[],
  rows: Row[],
  dragId: string,
  drop: DropTarget,
): FlatCat[] {
  const ids = subtree(dragId, flat);
  const rest = flat.filter((i) => !ids.includes(i.id));
  const newParent = parentForDrop(rows, drop.afterId, drop.depth);
  const moved = ids.map((id) => {
    const item = flat.find((i) => i.id === id)!;
    return id === dragId ? { ...item, parentId: newParent } : item;
  });
  if (drop.afterId === null) return [...moved, ...rest];
  const idx = rest.findIndex((i) => i.id === drop.afterId);
  rest.splice(idx + 1, 0, ...moved);
  return rest;
}

export function CategoriesView() {
  const isLoaded = usePageLoad(600);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  // ref so calcDrop always reads the current dragId without waiting for a re-render
  const dragIdRef = useRef<string | null>(null);
  const [items, setItems] = useState<FlatCat[]>(INIT);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["c1", "c3", "c1a"]),
  );
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropTarget | null>(null);

  const toggle = (id: string) =>
    setExpanded((p) => {
      const s = new Set(p);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const rows = flatten(buildTree(items), expanded);

  // The row that becomes the parent at the current drop target (for highlight)
  const potentialParentId = drop
    ? parentForDrop(rows, drop.afterId, drop.depth)
    : null;

  const calcDrop = (e: React.DragEvent, afterId: string | null) => {
    e.preventDefault();
    if (!dragIdRef.current || !ref.current) return;
    const x = e.clientX - ref.current.getBoundingClientRect().left;
    // Can only nest one level deeper than the row above — prevents orphan gaps
    const afterRow = afterId ? rows.find((r) => r.node.id === afterId) : null;
    const maxDepth = afterRow ? Math.min(afterRow.depth + 1, MAX_DEPTH) : 0;
    // Wider 96-px zones make each depth level easy to hit deliberately
    const depth = Math.max(0, Math.min(maxDepth, Math.floor(x / DEPTH_ZONE)));
    setDrop({ afterId, depth });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const currentDragId = dragIdRef.current;
    if (!currentDragId || !drop) {
      dragIdRef.current = null;
      setDragId(null);
      setDrop(null);
      return;
    }
    const ids = subtree(currentDragId, items);
    if (drop.afterId && ids.includes(drop.afterId)) {
      dragIdRef.current = null;
      setDragId(null);
      setDrop(null);
      return;
    }
    dragIdRef.current = null;
    setItems((prev) => applyDrop(prev, rows, currentDragId, drop));
    setDragId(null);
    setDrop(null);
  };

  const DEPTH_LABELS = ["Root", "Child", "Nested"] as const;

  const Line = ({ afterId }: { afterId: string | null }) =>
    drop?.afterId === afterId ? (
      <div className="relative h-0 overflow-visible pointer-events-none z-20">
        <motion.div
          initial={{ scaleX: 0.8, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          className="absolute h-0.5 bg-primary rounded-full"
          style={{ left: drop.depth * INDENT + INDENT, right: 0 }}
        />
        {/* dot at line start */}
        <div
          className="absolute w-2 h-2 rounded-full bg-primary border-2 border-background"
          style={{ left: drop.depth * INDENT + INDENT - 4, top: -3 }}
        />
        {/* depth label */}
        <div
          className="absolute top-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded leading-none whitespace-nowrap"
          style={{ left: drop.depth * INDENT + INDENT + 8 }}
        >
          {DEPTH_LABELS[drop.depth]}
        </div>
      </div>
    ) : null;

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
            title="Categories"
            description={`${INIT.length} categories · drag to reorder or change level`}
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "Categories" },
            ]}
          >
            <button
              onClick={() => router.push("/store/categories/add")}
              className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus size={18} className="stroke-[3]" />
              Add Category
            </button>
          </PageHeader>

          <div
            ref={ref}
            className="relative bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Depth guide rails — visible only while dragging */}
            {dragId && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {[1, 2, 3].map((d) => (
                  <div
                    key={d}
                    className="absolute top-0 bottom-0 w-px bg-primary/10"
                    style={{ left: d * INDENT }}
                  />
                ))}
              </div>
            )}

            {/* Sentinel: drop before the first row */}
            <div
              className="h-2"
              onDragOver={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (dragIdRef.current) setDrop({ afterId: null, depth: 0 });
              }}
            />
            <Line afterId={null} />

            {rows.map(({ node, depth, hasChildren }) => (
              <div key={node.id}>
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    dragIdRef.current = node.id;
                    setDragId(node.id);
                  }}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    calcDrop(e, node.id);
                  }}
                  onDragEnd={() => {
                    dragIdRef.current = null;
                    setDragId(null);
                    setDrop(null);
                  }}
                  onMouseEnter={() => setHoverId(node.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={cn(
                    "flex items-stretch border-b border-border/40 transition-colors select-none",
                    dragId === node.id && "opacity-30",
                    potentialParentId === node.id &&
                      dragId !== node.id &&
                      "bg-primary/5 ring-1 ring-inset ring-primary/20",
                  )}
                >
                  {/* depth spacer */}
                  {depth > 0 && (
                    <div
                      style={{ width: depth * INDENT }}
                      className="shrink-0"
                    />
                  )}

                  {/* drag handle */}
                  <div className="w-12 shrink-0 flex items-center justify-center bg-muted/50 border-r border-border/30 cursor-grab active:cursor-grabbing">
                    <GripVertical
                      size={15}
                      className="text-muted-foreground/60"
                    />
                  </div>

                  {/* expand toggle */}
                  <div className="w-8 shrink-0 flex items-center justify-center">
                    {hasChildren ? (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        {expanded.has(node.id) ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronRight size={13} />
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
                        "h-7 w-7 rounded-sm flex items-center justify-center",
                        depth === 0 ? "bg-primary/15" : "bg-primary/8",
                      )}
                    >
                      {hasChildren ? (
                        <FolderOpen size={13} className="text-primary" />
                      ) : (
                        <Folder size={13} className="text-primary/70" />
                      )}
                    </div>
                  </div>

                  {/* name + slug */}
                  <div className="flex-1 flex items-center gap-2 py-3.5 min-w-0">
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
                  </div>

                  {/* meta + hover actions */}
                  <div className="relative flex items-center gap-3 px-4 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums hidden md:inline">
                      {node.productCount} products
                    </span>
                    <StatusBadge
                      variant={node.status === "active" ? "success" : "muted"}
                      label={node.status === "active" ? "Active" : "Inactive"}
                      size="sm"
                    />
                    <div
                      className={cn(
                        "absolute right-4 bg-white dark:bg-muted flex items-center gap-1.5 transition-opacity duration-500",
                        hoverId === node.id
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none",
                      )}
                    >
                      <button
                        title="View"
                        className="p-1.5 rounded-md text-violet-500 hover:bg-violet-500/10 transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title="Edit"
                        onClick={() =>
                          router.push(`/store/categories/${node.id}/edit`)
                        }
                        className="p-1.5 rounded-md text-teal-500 hover:bg-teal-500/10 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete"
                        className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <Line afterId={node.id} />
              </div>
            ))}

            {/* Sentinel: drop after the last row */}
            <div
              className="h-8"
              onDragOver={(e) => {
                e.stopPropagation();
                calcDrop(e, rows[rows.length - 1]?.node.id ?? null);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
