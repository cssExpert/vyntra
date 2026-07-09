"use client";

import { useState } from "react";
import { RotateCcw, Eye } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { BLOCK_META, BLOCK_DEFAULTS } from "@/lib/themes/shopingo/blockDefaults";
import { BlockForm } from "./BlockForm";
import type { BlockType } from "@/lib/themes/types";
import type { EditorNode } from "@/types/editor";

// Block-category colour accent
const CATEGORY_COLOR: Record<string, string> = {
  "hero-carousel":   "#7c3aed",
  "promo-banner":    "#7c3aed",
  "page-header":     "#7c3aed",
  "product-grid":    "#0ea5e9",
  "product-tabs":    "#0ea5e9",
  "category-grid":   "#10b981",
  "brand-carousel":  "#10b981",
  "text-image":      "#f59e0b",
  "blog-section":    "#f59e0b",
  "features-banner": "#f59e0b",
  "newsletter":      "#e4611e",
  "contact-form":    "#e4611e",
  "contact-form-info": "#e4611e",
  "google-map":      "#e4611e",
  "custom-html":     "#6b7280",
};

export function BlockDataEditor({ node }: { node: EditorNode }) {
  const { updateNode } = useEditorStore();
  const data = (node.blockData ?? {}) as Record<string, unknown>;
  const meta = BLOCK_META[node.blockType as BlockType];
  const accent = CATEGORY_COLOR[node.blockType ?? ""] ?? "#6b7280";
  const [confirmReset, setConfirmReset] = useState(false);

  function setField(key: string, value: unknown) {
    updateNode(node.id, { blockData: { ...data, [key]: value } });
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    const defaults = BLOCK_DEFAULTS[node.blockType as BlockType];
    if (defaults) {
      updateNode(node.id, { blockData: { ...defaults } });
    }
    setConfirmReset(false);
  }

  return (
    <aside className="w-64 flex flex-col h-full overflow-hidden border-l bg-card border-border dark:border-border">

      {/* Block header */}
      <div className="shrink-0 border-b border-border dark:border-border">
        {/* Colour accent strip */}
        <div className="h-0.5 w-full" style={{ background: accent }} />

        <div className="px-4 pt-3 pb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide text-white shrink-0"
                style={{ background: accent }}
              >
                block
              </span>
              <h3 className="text-sm font-bold text-foreground dark:text-foreground truncate">
                {meta?.label ?? node.blockType}
              </h3>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Eye className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-500">
                Live
              </span>
            </div>
          </div>

          {meta?.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
              {meta.description}
            </p>
          )}

          {/* Reset button */}
          {BLOCK_DEFAULTS[node.blockType as BlockType] && (
            <button
              type="button"
              onClick={handleReset}
              className={`mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all
                ${confirmReset
                  ? "border-red-400 text-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50"}`}
            >
              <RotateCcw className="w-3 h-3" />
              {confirmReset ? "Click again to confirm reset" : "Reset to defaults"}
            </button>
          )}
        </div>
      </div>

      {/* Schema-driven form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <BlockForm
          key={node.id}
          blockType={node.blockType ?? ""}
          data={data}
          onSetField={setField}
        />
      </div>

    </aside>
  );
}
