"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { nanoid } from "nanoid";
import {
  ChevronLeft, ExternalLink, GripVertical, Trash2,
  Loader2, Eye, EyeOff,
} from "lucide-react";
import { BLOCK_META, BLOCK_DEFAULTS } from "@/lib/themes/shopingo/blockDefaults";
import { BlockPalette } from "./theme-builder/BlockPalette";
import { BlockConfigPanel } from "./theme-builder/BlockConfigPanel";
import type { TypedBlock, BlockType } from "@/lib/themes/types";
import { cmsPages, cmsThemes, type DbTheme } from "@/lib/api";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";

type SaveState = "idle" | "saving" | "saved" | "error";

function useDragReorder(
  blocks: TypedBlock[],
  setBlocks: (b: TypedBlock[]) => void,
) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function onDragStart(i: number) { setDragIdx(i); }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const next = [...blocks];
    const [item] = next.splice(dragIdx, 1);
    next.splice(i, 0, item);
    setBlocks(next);
    setDragIdx(i);
  }
  function onDrop() { setDragIdx(null); }

  return { dragIdx, onDragStart, onDragOver, onDrop };
}

export function ThemePageBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("page");
  const { previewUrl } = useSitePreviewUrl();

  const [blocks, setBlocks] = useState<TypedBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<TypedBlock | null>(null);
  const [pageTitle, setPageTitle] = useState(
    pageSlug ? pageSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "New Page",
  );
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [draftState, setDraftState] = useState<SaveState>("idle");
  const [availableThemes, setAvailableThemes] = useState<DbTheme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const { dragIdx, onDragStart, onDragOver, onDrop } = useDragReorder(blocks, setBlocks);

  useEffect(() => {
    cmsThemes.list()
      .then((res) => setAvailableThemes(res.global ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!pageSlug) { setLoading(false); return; }
    cmsPages.load(pageSlug)
      .then((page) => {
        if (page?.title) setPageTitle(page.title);
        if (page?.themeId !== undefined) setSelectedThemeId(page.themeId);
        if (page?.content) {
          try {
            const parsed = JSON.parse(page.content);
            if (Array.isArray(parsed) && parsed[0]?.type && parsed[0]?.data) {
              setBlocks(parsed as TypedBlock[]);
            }
          } catch { /* empty page */ }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageSlug]);

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: TypedBlock = {
      id: nanoid(8),
      type,
      data: BLOCK_DEFAULTS[type] as never,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock);
  }, []);

  const handleSelectBlock = (block: TypedBlock) => setSelectedBlock(block);

  const handleSaveBlock = (updated: TypedBlock) => {
    setBlocks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
    setSelectedBlock(updated);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock?.id === id) setSelectedBlock(null);
  };

  async function save(publish: boolean) {
    if (!pageSlug) return;
    const setter = publish ? setSaveState : setDraftState;
    setter("saving");
    try {
      await cmsPages.save(pageSlug, {
        content: JSON.stringify(blocks),
        publish,
        themeId: selectedThemeId,
      });
      setter("saved");
      setTimeout(() => setter("idle"), 2000);
    } catch {
      setter("error");
      setTimeout(() => setter("idle"), 3000);
    }
  }

  const previewHref = previewUrl(pageSlug ?? undefined) ?? undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4 px-4 h-14 border-b border-border shrink-0 bg-background z-10">
        <button
          onClick={() => router.push("/cms/pages")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={15} />
          Pages
        </button>
        <div className="w-px h-5 bg-border" />
        <span className="text-sm font-semibold text-foreground truncate max-w-xs">{pageTitle}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border" style={{ borderColor: "#e4611e", color: "#e4611e" }}>
          Theme Builder
        </span>

        <div className="ml-auto flex items-center gap-2">
          {availableThemes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden sm:inline">Theme:</span>
              <select
                value={selectedThemeId ?? ""}
                onChange={(e) => setSelectedThemeId(e.target.value || null)}
                className="text-xs rounded border border-border bg-background text-foreground px-2 py-1.5 outline-none focus:ring-1 focus:ring-orange-400 cursor-pointer"
              >
                <option value="">Inherit (org default)</option>
                {availableThemes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.identifier})</option>
                ))}
              </select>
            </div>
          )}

          {previewHref && (
            <Link
              href={previewHref}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border hover:border-foreground/30"
            >
              <ExternalLink size={12} />
              Preview
            </Link>
          )}
          <button
            onClick={() => save(false)}
            disabled={draftState === "saving"}
            className="px-4 py-1.5 text-xs font-semibold rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            {draftState === "saving" ? "Saving…" : draftState === "saved" ? "Saved ✓" : "Save Draft"}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saveState === "saving"}
            className="px-4 py-1.5 text-xs font-semibold rounded text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#e4611e" }}
          >
            {saveState === "saving" ? "Publishing…" : saveState === "saved" ? "Published ✓" : "Publish"}
          </button>
        </div>
      </header>

      {/* ── Main 3-panel layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Block Palette */}
        <BlockPalette onAdd={handleAddBlock} />

        {/* Center: Canvas */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <EyeOff size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No blocks yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Click a block type in the left panel to add it to the page.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl mx-auto">
              {blocks.map((block, i) => {
                const meta = BLOCK_META[block.type];
                const isSelected = selectedBlock?.id === block.id;
                const isDraggingThis = dragIdx === i;
                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={onDrop}
                    onClick={() => handleSelectBlock(block)}
                    className={[
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none",
                      isSelected
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20 shadow-sm"
                        : "border-border bg-background hover:border-orange-300 hover:shadow-sm",
                      isDraggingThis ? "opacity-40" : "",
                    ].join(" ")}
                  >
                    <GripVertical size={14} className="text-muted-foreground shrink-0 cursor-grab" />
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded" style={{ backgroundColor: "#e4611e20", color: "#e4611e" }}>
                      {block.type}
                    </span>
                    <span className="text-sm font-medium text-foreground flex-1 truncate">{meta?.label ?? block.type}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectBlock(block); }}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Configure"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-muted-foreground hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {blocks.length} block{blocks.length !== 1 ? "s" : ""} · Drag to reorder · Click to configure
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right: Config Panel */}
        <BlockConfigPanel
          block={selectedBlock}
          onSave={handleSaveBlock}
          onClose={() => setSelectedBlock(null)}
        />
      </div>
    </div>
  );
}
