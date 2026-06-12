"use client";

import { useEditorStore } from "@/store/editorStore";
import { BLOCK_META } from "@/lib/themes/shopingo/blockDefaults";
import { BlockForm } from "./BlockForm";
import type { BlockType } from "@/lib/themes/types";
import type { EditorNode } from "@/types/editor";

export function BlockDataEditor({ node }: { node: EditorNode }) {
  const { updateNode } = useEditorStore();
  const data = (node.blockData ?? {}) as Record<string, unknown>;
  const meta = BLOCK_META[node.blockType as BlockType];

  function setField(key: string, value: unknown) {
    updateNode(node.id, { blockData: { ...data, [key]: value } });
  }

  return (
    <aside className="w-64 flex flex-col h-full overflow-hidden border-l bg-card border-border dark:border-border">

      {/* Block header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border dark:border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#ff2c2c] text-white uppercase tracking-wide shrink-0">
            block
          </span>
          <h3 className="text-sm font-bold text-foreground dark:text-foreground truncate">
            {meta?.label ?? node.blockType}
          </h3>
        </div>
        {meta?.description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
            {meta.description}
          </p>
        )}
      </div>

      {/* Schema-driven form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <BlockForm key={node.id} blockType={node.blockType ?? ""} data={data} onSetField={setField} />
      </div>

    </aside>
  );
}
