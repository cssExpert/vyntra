"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Grid3x3,
  Loader2,
  X,
  Library,
  Puzzle,
  LayoutTemplate,
  FileCode2,
  Palette,
  Globe,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { COMPONENT_BLOCKS } from "@/lib/componentBlocks";
import {
  BLOCK_META,
  BLOCK_DEFAULTS,
} from "@/lib/themes/shopingo/blockDefaults";
import type { BlockType } from "@/lib/themes/types";
import { useEditorStore } from "@/store/editorStore";
import type { ComponentBlock, EditorNode } from "@/types/editor";
import { cn } from "@/lib/utils";
import Icon from "@/components/common/Icon";
import { Input } from "@/components/ui/input";

function DraggableThemeBlock({ blockType }: { blockType: BlockType }) {
  const meta = BLOCK_META[blockType];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `theme-block-${blockType}`,
    data: {
      type: "THEME_BLOCK",
      blockType,
      blockData: BLOCK_DEFAULTS[blockType],
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none",
        "border border-transparent transition-all duration-150",
        "hover:bg-[#ff2c2c]/10 hover:border-[#ff2c2c]/30",
        isDragging && "opacity-30 scale-95",
      )}
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[#ff2c2c]/10 text-[#ff2c2c]">
        <Grid3x3 className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium truncate text-muted-foreground">
        {meta.label}
      </span>
    </div>
  );
}

function DraggableBlock({ block }: { block: ComponentBlock }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: { type: "BLOCK", blockId: block.id, template: block.template },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none",
        "border border-transparent transition-all duration-150",
        "hover:bg-primary/10 hover:border-primary dark:hover:bg-primary/10 dark:hover:border-primary/25",
        isDragging && "opacity-30 scale-95",
      )}
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground">
        <Grid3x3 className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium truncate text-muted-foreground dark:text-muted-foreground">
        {block.label}
      </span>
    </div>
  );
}

const UNIFIED_GROUPS: {
  label: string;
  themeBlocks: BlockType[];
  htmlCategories: string[];
}[] = [
  { label: "Hero", themeBlocks: ["hero-carousel", "promo-banner", "page-header"], htmlCategories: ["Hero"] },
  { label: "Navigation", themeBlocks: [], htmlCategories: ["Navbar"] },
  { label: "Product List", themeBlocks: ["product-grid", "product-tabs"], htmlCategories: [] },
  { label: "Discovery", themeBlocks: ["category-grid", "brand-carousel"], htmlCategories: [] },
  { label: "Blogs", themeBlocks: ["blog-section", "text-image"], htmlCategories: [] },
  { label: "Features", themeBlocks: ["features-banner"], htmlCategories: ["Features"] },
  { label: "Pricing", themeBlocks: [], htmlCategories: ["Pricing"] },
  { label: "Testimonials", themeBlocks: [], htmlCategories: ["Testimonials"] },
  { label: "FAQ", themeBlocks: [], htmlCategories: ["FAQ"] },
  { label: "Team", themeBlocks: [], htmlCategories: ["Team"] },
  { label: "Footer", themeBlocks: [], htmlCategories: ["Footer"] },
  { label: "Contact & Forms", themeBlocks: ["newsletter", "contact-form"], htmlCategories: ["Contact", "Forms"] },
  { label: "Portfolio", themeBlocks: [], htmlCategories: ["Portfolio"] },
  { label: "Cards", themeBlocks: [], htmlCategories: ["Cards"] },
  { label: "Typography", themeBlocks: [], htmlCategories: ["Typography"] },
  { label: "Buttons", themeBlocks: [], htmlCategories: ["Buttons"] },
  { label: "Layout", themeBlocks: [], htmlCategories: ["Containers"] },
  { label: "Images", themeBlocks: [], htmlCategories: ["Images"] },
  { label: "Custom", themeBlocks: ["custom-html"], htmlCategories: [] },
];

function UnifiedCategorySection({
  label,
  themeBlocks,
  htmlBlocks,
}: {
  label: string;
  themeBlocks: BlockType[];
  htmlBlocks: ComponentBlock[];
}) {
  const [open, setOpen] = useState(true);
  const total = themeBlocks.length + htmlBlocks.length;
  if (total === 0) return null;

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-[10px] opacity-60">{total}</span>
          {open ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            <div className="pb-1">
              {themeBlocks.map((bt) => (
                <DraggableThemeBlock key={bt} blockType={bt} />
              ))}
              {htmlBlocks.map((b) => (
                <DraggableBlock key={b.id} block={b} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Brand() {
  return (
    <div className="flex h-16 flex-shrink-0 items-center border-b border-sidebar-border px-4">
      <Link
        href="/cms/pages"
        className="flex items-center gap-2.5 group cursor-pointer"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-primary shadow-glow-brand">
          <Icon name="Logo" size="20" className="h-5 w-5 text-white" />
        </div>
        <span className="text-md font-extrabold font-merienda text-foreground">
          ERVFlow
        </span>
      </Link>
    </div>
  );
}

export default function LeftSidebar() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"blocks" | "layers" | "library">(
    "blocks",
  );
  const [mounted, setMounted] = useState(false);
  const { selectedId } = useEditorStore();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => setActiveTab("layers"), 0);
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  const isSearching = search !== debouncedSearch;

  useEffect(() => {
    if (!search.trim()) {
      // setDebouncedSearch(search);
      return;
    }
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function clearSearch() {
    setSearch("");
    setDebouncedSearch("");
  }

  const filteredHtml = debouncedSearch.trim()
    ? COMPONENT_BLOCKS.filter(
        (b) =>
          b.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          b.category.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : null;

  const filteredTheme = debouncedSearch.trim()
    ? (Object.keys(BLOCK_META) as BlockType[]).filter((bt) =>
        BLOCK_META[bt].label.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : null;

  const isFiltered = filteredHtml !== null;

  return (
    <aside className="w-65 flex flex-col h-full overflow-hidden border-r bg-card border-border dark:border-border">
      <Brand />

      {/* Tab bar + Search container */}
      <div className="shrink-0 p-2 border-b border-border dark:border-border flex flex-col gap-2">
        {/* Sliding Pill Tabs Track */}
        <div className="relative flex p-1 bg-muted dark:bg-muted rounded-lg">
          {/* The Sliding Pill background */}
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(33.333%-2.667px)] rounded-md bg-card shadow-sm dark:bg-primary transition-transform duration-200 ease-out-quad"
            style={{
              transform:
                activeTab === "layers"
                  ? "translateX(100%)"
                  : activeTab === "library"
                    ? "translateX(200%)"
                    : "translateX(0)",
            }}
          />

          {(["blocks", "layers", "library"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors duration-200",
                  active
                    ? "text-foreground dark:text-primary-foreground font-semibold"
                    : "text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground",
                )}
              >
                {tab === "blocks" ? (
                  <Grid3x3 className="w-3.5 h-3.5 shrink-0" />
                ) : tab === "layers" ? (
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Library className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="capitalize">{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          {/* Left icon */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-primary dark:text-primary animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-muted-foreground dark:text-muted-foreground" />
            )}
          </div>

          <Input
            type="text"
            placeholder={
              activeTab === "blocks"
                ? "Search blocks…"
                : activeTab === "layers"
                  ? "Search layers…"
                  : "Search library…"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 rounded-md text-xs transition-colors bg-muted dark:bg-muted border border-border dark:border-border text-foreground dark:text-foreground focus:outline-none focus:border-primary dark:focus:border-primary"
            style={{ paddingRight: search ? "1.75rem" : "0.5rem" }}
          />

          {/* Clear button */}
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2
                w-4 h-4 rounded-full flex items-center justify-center
                bg-muted dark:bg-card/15
                text-muted-foreground dark:text-muted-foreground
                hover:bg-muted dark:hover:bg-card/25
                transition-colors"
              aria-label="Clear search"
            >
              <X className="w-2 h-2" />
            </button>
          )}
        </div>
      </div>

      {/* Content Side panel */}
      <div className="flex-1 overflow-y-auto pt-0 pb-1.5 custom-scrollbar">
        {!mounted ? (
          <div className="w-full h-20 animate-pulse bg-muted dark:bg-foreground/50" />
        ) : activeTab === "blocks" ? (
          isSearching ? (
            /* Loading state while debounce is pending */
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="w-5 h-5 text-primary dark:text-primary animate-spin" />
              <p className="text-[11px] text-muted-foreground dark:text-muted-foreground">
                Searching…
              </p>
            </div>
          ) : isFiltered ? (
            <div className="px-1">
              {filteredHtml!.length === 0 && filteredTheme!.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-1.5 px-3 text-center">
                  <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
                    No blocks found
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-[11px] text-primary dark:text-primary hover:underline underline-offset-2"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  {filteredTheme!.map((bt) => (
                    <DraggableThemeBlock key={bt} blockType={bt} />
                  ))}
                  {filteredHtml!.map((b) => (
                    <DraggableBlock key={b.id} block={b} />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="px-1 pt-1">
              {UNIFIED_GROUPS.map((group) => (
                <UnifiedCategorySection
                  key={group.label}
                  label={group.label}
                  themeBlocks={group.themeBlocks}
                  htmlBlocks={COMPONENT_BLOCKS.filter((b) =>
                    group.htmlCategories.includes(b.category),
                  )}
                />
              ))}
            </div>
          )
        ) : activeTab === "layers" ? (
          <LayersPanel />
        ) : (
          <LibraryPanel search={debouncedSearch} />
        )}
      </div>
    </aside>
  );
}


// ── Library Panel (Figma Assets-style) ────────────────────────────────────────

import {
  useLibraryStore,
  type SavedComponent,
  type BrandKit,
  type GlobalElement,
} from "@/store/libraryStore";
const SECTION_CATEGORIES = [
  "Landing Pages",
  "Business",
  "SaaS",
  "Store",
  "Blog",
  "Portfolio",
] as const;

function SectionHeader({
  icon: Ico,
  label,
  count,
  open,
  onToggle,
  action,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center">
      <button
        onClick={onToggle}
        className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
        <Ico className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1 text-xs font-semibold text-foreground text-left truncate">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums mr-1">
          {count}
        </span>
      </button>
      {action && <div className="pr-2">{action}</div>}
    </div>
  );
}

function EmptyState({
  text,
  action,
}: {
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-3 pb-4 pt-1 flex flex-col items-center gap-2">
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        {text}
      </p>
      {action}
    </div>
  );
}

function LibraryItemRow({
  label,
  sublabel,
  badge,
  onDelete,
}: {
  label: string;
  sublabel?: string;
  badge?: React.ReactNode;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 transition-colors cursor-grab active:cursor-grabbing">
      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
        <Puzzle className="w-3 h-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{label}</p>
        {sublabel && (
          <p className="text-[10px] text-muted-foreground">{sublabel}</p>
        )}
      </div>
      {badge}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-red-500"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── My Components ─────────────────────────────────────────────────────────────

function MyComponentsSection({
  search,
  open,
  onToggle,
  sectionRef,
}: {
  search: string;
  open: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { components, deleteComponent, setPendingSave } = useLibraryStore();
  const filtered = search
    ? components.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : components;

  const byCategory = filtered.reduce<Record<string, SavedComponent[]>>(
    (acc, c) => {
      (acc[c.category] ??= []).push(c);
      return acc;
    },
    {},
  );

  return (
    <div ref={sectionRef} className="border-b border-border">
      <SectionHeader
        icon={Puzzle}
        label="My Components"
        count={components.length}
        open={open}
        onToggle={onToggle}
        action={
          <button
            onClick={() => {
              const { nodes, selectedId } = useEditorStore.getState();
              const node = selectedId ? (nodes.find((n) => n.id === selectedId) ?? null) : null;
              setPendingSave(node, "component");
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Save selected as component"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        }
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            {filtered.length === 0 ? (
              <EmptyState
                text={
                  search
                    ? `No components match "${search}"`
                    : "Select any element on canvas and click  to save it as a reusable component."
                }
                action={
                  !search && (
                    <p className="text-[10px] text-muted-foreground/60 text-center">
                      Tip: use the <Puzzle className="inline w-2.5 h-2.5" />{" "}
                      button in the canvas toolbar
                    </p>
                  )
                }
              />
            ) : (
              <div className="pb-1">
                {Object.entries(byCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {cat}
                    </p>
                    {items.map((c) => (
                      <LibraryItemRow
                        key={c.id}
                        label={c.name}
                        sublabel={c.isGlobal ? "Global" : "Local"}
                        badge={
                          c.isGlobal ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              Global
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                              Local
                            </span>
                          )
                        }
                        onDelete={() => deleteComponent(c.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── My Sections ───────────────────────────────────────────────────────────────

function MySectionsSection({
  search,
  open,
  onToggle,
  sectionRef,
}: {
  search: string;
  open: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { sections, deleteSection, setPendingSave } = useLibraryStore();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTION_CATEGORIES.map((c) => [c, true])),
  );

  const filtered = search
    ? sections.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      )
    : sections;

  const byCategory = filtered.reduce<Record<string, typeof filtered>>(
    (acc, s) => {
      (acc[s.category] ??= []).push(s);
      return acc;
    },
    {},
  );

  return (
    <div ref={sectionRef} className="border-b border-border">
      <SectionHeader
        icon={LayoutTemplate}
        label="My Sections"
        count={sections.length}
        open={open}
        onToggle={onToggle}
        action={
          <button
            onClick={() => {
              const { nodes, selectedId } = useEditorStore.getState();
              const node = selectedId ? (nodes.find((n) => n.id === selectedId) ?? null) : null;
              setPendingSave(node, "section");
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Save selected as section"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        }
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            {sections.length === 0 && !search ? (
              <EmptyState
                text="Save entire page sections — Hero, Pricing, FAQ — for reuse across pages."
                action={
                  <p className="text-[10px] text-muted-foreground/60 text-center">
                    Select a <code className="font-mono">&lt;section&gt;</code>{" "}
                    on canvas and click{" "}
                    <LayoutTemplate className="inline w-2.5 h-2.5" />
                  </p>
                }
              />
            ) : (
              <div className="pb-1">
                {SECTION_CATEGORIES.map((cat) => {
                  const items = byCategory[cat] ?? [];
                  if (items.length === 0 && search) return null;
                  return (
                    <div key={cat}>
                      <button
                        onClick={() =>
                          setOpenCats((p) => ({ ...p, [cat]: !p[cat] }))
                        }
                        className="w-full flex items-center justify-between px-4 py-1 hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {cat}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span className="text-[10px]">{items.length}</span>
                          {openCats[cat] ? (
                            <ChevronDown className="w-2.5 h-2.5" />
                          ) : (
                            <ChevronRight className="w-2.5 h-2.5" />
                          )}
                        </span>
                      </button>
                      {openCats[cat] && items.length === 0 && (
                        <p className="px-5 pb-2 text-[10px] text-muted-foreground/50 italic">
                          No sections yet
                        </p>
                      )}
                      {openCats[cat] &&
                        items.map((s) => (
                          <LibraryItemRow
                            key={s.id}
                            label={s.name}
                            sublabel={s.category}
                            onDelete={() => deleteSection(s.id)}
                          />
                        ))}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────

function TemplatesSection({
  open,
  onToggle,
  sectionRef,
}: {
  open: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  return (
    <div ref={sectionRef} className="border-b border-border">
      <SectionHeader
        icon={FileCode2}
        label="Templates"
        count={0}
        open={open}
        onToggle={onToggle}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            <div className="pb-1">
              {SECTION_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <button
                    onClick={() =>
                      setOpenCats((p) => ({ ...p, [cat]: !p[cat] }))
                    }
                    className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {cat}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {openCats[cat] ? (
                        <ChevronDown className="w-2.5 h-2.5" />
                      ) : (
                        <ChevronRight className="w-2.5 h-2.5" />
                      )}
                    </span>
                  </button>
                  {openCats[cat] && (
                    <p className="px-5 pb-2 text-[10px] text-muted-foreground/50 italic">
                      Coming soon
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Brand Kits ────────────────────────────────────────────────────────────────

function BrandKitsSection({
  open,
  onToggle,
  sectionRef,
}: {
  open: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { brandKits, deleteBrandKit, activateBrandKit, setBrandKitModalOpen } = useLibraryStore();

  return (
    <div ref={sectionRef} className="border-b border-border">
      <SectionHeader
        icon={Palette}
        label="Brand Kits"
        count={brandKits.length}
        open={open}
        onToggle={onToggle}
        action={
          <button
            onClick={() => setBrandKitModalOpen(true)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Create brand kit"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        }
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            {brandKits.length === 0 ? (
              <EmptyState
                text="Define colors, fonts, logos and button styles. Apply a kit to restyle the whole site."
                action={
                  <button
                    onClick={() => setBrandKitModalOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Brand Kit
                  </button>
                }
              />
            ) : (
              <div className="pb-1 px-2 flex flex-col gap-1">
                {brandKits.map((kit) => (
                  <BrandKitRow
                    key={kit.id}
                    kit={kit}
                    onActivate={() => activateBrandKit(kit.id)}
                    onDelete={() => deleteBrandKit(kit.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrandKitRow({
  kit,
  onActivate,
  onDelete,
}: {
  kit: BrandKit;
  onActivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/30 transition-colors">
      {/* Color swatches */}
      <div className="flex gap-0.5 shrink-0">
        {[kit.primaryColor, kit.secondaryColor, kit.accentColor].map((c, i) => (
          <span
            key={i}
            className="w-3.5 h-5 rounded-sm border border-black/10"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {kit.name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {kit.fontHeading} / {kit.fontBody}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onActivate}
          className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
            kit.isActive
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-primary hover:text-white"
          }`}
        >
          {kit.isActive ? "Active" : "Apply"}
        </button>
        <button
          onClick={onDelete}
          className="p-0.5 text-muted-foreground hover:text-red-500"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {kit.isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
      )}
    </div>
  );
}

// ── Global Elements ───────────────────────────────────────────────────────────

const GLOBAL_ICONS: Record<string, React.ElementType> = {
  header: Globe,
  footer: Globe,
  "announcement-bar": Globe,
  "contact-cta": Globe,
};

const GLOBAL_LABELS: Record<string, string> = {
  header: "Header",
  footer: "Footer",
  "announcement-bar": "Announcement Bar",
  "contact-cta": "Contact CTA",
};

function GlobalElementsSection({
  open,
  onToggle,
  sectionRef,
}: {
  open: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { globalElements, deleteGlobalElement, setGlobalElementModalOpen } = useLibraryStore();

  return (
    <div ref={sectionRef} className="border-b border-border">
      <SectionHeader
        icon={Globe}
        label="Global Elements"
        count={globalElements.length}
        open={open}
        onToggle={onToggle}
        action={
          <button
            onClick={() => setGlobalElementModalOpen(true)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Add global element"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        }
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            {globalElements.length === 0 ? (
              <EmptyState
                text="Save headers, footers and site-wide elements. Edit once — updates everywhere."
                action={
                  <button
                    onClick={() => setGlobalElementModalOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Global Element
                  </button>
                }
              />
            ) : (
              <div className="pb-1">
                {globalElements.map((el: GlobalElement) => (
                  <div
                    key={el.id}
                    className="group flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {el.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {GLOBAL_LABELS[el.elementType] ?? el.elementType}
                        {el.syncAcrossPages && " · Synced"}
                      </p>
                    </div>
                    {el.syncAcrossPages && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"
                        title="Synced across pages"
                      />
                    )}
                    <button
                      onClick={() => deleteGlobalElement(el.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Marketplace ───────────────────────────────────────────────────────────────

function MarketplaceSection({
  open,
  onToggle,
  sectionRef,
}: {
  open: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={sectionRef} className="border-b border-border last:border-b-0">
      <SectionHeader
        icon={Library}
        label="Marketplace"
        count={0}
        open={open}
        onToggle={onToggle}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 pt-2 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Library className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">
                  Coming Soon
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Premium templates, community components and agency kits.
                </p>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                {[
                  "Premium Templates",
                  "Community Components",
                  "Agency Kits",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted border border-border/50"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      {item}
                    </span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                      Soon
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Library Panel ────────────────────────────────────────────────────────

const SECTION_IDS = [
  "components",
  "sections",
  "templates",
  "brand-kits",
  "global-elements",
  "marketplace",
] as const;
type SectionId = (typeof SECTION_IDS)[number];

const QUICK_ACCESS = [
  { icon: Puzzle, label: "Components", sectionId: "components" as SectionId },
  { icon: Palette, label: "Brand Kits", sectionId: "brand-kits" as SectionId },
  { icon: Globe, label: "Global", sectionId: "global-elements" as SectionId },
  {
    icon: Library,
    label: "Marketplace",
    sectionId: "marketplace" as SectionId,
  },
] as const;

function LibraryPanel({ search }: { search: string }) {
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>(
    () =>
      Object.fromEntries(SECTION_IDS.map((s) => [s, true])) as Record<
        SectionId,
        boolean
      >,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<
    Record<SectionId, React.RefObject<HTMLDivElement | null>>
  >(
    Object.fromEntries(
      SECTION_IDS.map((s) => [s, { current: null }]),
    ) as Record<SectionId, React.RefObject<HTMLDivElement | null>>,
  );

  function toggle(id: SectionId) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function jumpToSection(sectionId: SectionId) {
    setOpenSections((prev) => ({ ...prev, [sectionId]: true }));
    setTimeout(() => {
      sectionRefs.current[sectionId]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quick-access 2×2 grid */}
      <div className="grid grid-cols-4 gap-px bg-border border-b border-border shrink-0">
        {QUICK_ACCESS.map(({ icon: Ico, label, sectionId }) => (
          <button
            key={label}
            onClick={() => jumpToSection(sectionId)}
            className="flex flex-col items-center gap-1 py-2 bg-card hover:bg-primary/10 transition-colors group"
          >
            <Ico className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[9px] text-muted-foreground group-hover:text-primary transition-colors leading-tight text-center">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Sections list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <MyComponentsSection
          search={search}
          open={openSections.components}
          onToggle={() => toggle("components")}
          sectionRef={sectionRefs.current.components}
        />
        <MySectionsSection
          search={search}
          open={openSections.sections}
          onToggle={() => toggle("sections")}
          sectionRef={sectionRefs.current.sections}
        />
        <TemplatesSection
          open={openSections.templates}
          onToggle={() => toggle("templates")}
          sectionRef={sectionRefs.current.templates}
        />
        <BrandKitsSection
          open={openSections["brand-kits"]}
          onToggle={() => toggle("brand-kits")}
          sectionRef={sectionRefs.current["brand-kits"]}
        />
        <GlobalElementsSection
          open={openSections["global-elements"]}
          onToggle={() => toggle("global-elements")}
          sectionRef={sectionRefs.current["global-elements"]}
        />
        <MarketplaceSection
          open={openSections.marketplace}
          onToggle={() => toggle("marketplace")}
          sectionRef={sectionRefs.current.marketplace}
        />
      </div>

      {/* Modals are mounted in EditorLayout to avoid overflow-hidden clipping */}
    </div>
  );
}

function LayersPanel() {
  const { nodes, selectedId, selectNode } = useEditorStore();

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-4 text-center h-full">
        <Layers className="w-8 h-8 mb-2 text-muted-foreground dark:text-muted-foreground" />
        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
          No elements on canvas yet
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      {nodes.map((node: EditorNode) => (
        <LayerItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={selectNode}
        />
      ))}
    </div>
  );
}

function LayerItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: EditorNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer text-xs transition-colors",
          isSelected
            ? "bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary"
            : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted",
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="text-muted-foreground dark:text-muted-foreground"
          >
            {open ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-3 h-3 shrink-0" />
        )}
        <span className="font-mono text-muted-foreground dark:text-muted-foreground">
          &lt;{node.tag}&gt;
        </span>
        <span className="truncate ml-1">{node.type}</span>
      </div>
      {hasChildren &&
        open &&
        node.children!.map((child) => (
          <LayerItem
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
