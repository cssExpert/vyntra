"use client";

import { X } from "lucide-react";
import { BLOCK_META } from "@/lib/themes/shopingo/blockDefaults";
import { BlockForm } from "@/components/editor/RightSidebar/BlockForm";
import type { TypedBlock, BlockType } from "@/lib/themes/types";

interface Props {
  block: TypedBlock | null;
  onSave: (block: TypedBlock) => void;
  onClose: () => void;
}

export function BlockConfigPanel({ block, onSave, onClose }: Props) {
  if (!block) {
    return (
      <aside className="w-80 flex-shrink-0 border-l border-border bg-muted/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center px-6">
          Click a block in the palette or select one on the canvas to configure it.
        </p>
      </aside>
    );
  }

  const meta = BLOCK_META[block.type as BlockType];
  const data = (block.data as unknown as Record<string, unknown>) ?? {};

  function setField(key: string, value: unknown) {
    onSave({ ...block, data: { ...data, [key]: value } } as unknown as TypedBlock);
  }

  return (
    <aside className="w-80 flex-shrink-0 border-l border-border bg-background flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-orange-500 text-white uppercase tracking-wide shrink-0">
              block
            </span>
            <p className="text-sm font-semibold text-foreground truncate">
              {meta?.label ?? block.type}
            </p>
          </div>
          {meta?.description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
              {meta.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Schema-driven form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <BlockForm key={block.id} blockType={block.type} data={data} onSetField={setField} />
      </div>

    </aside>
  );
}
