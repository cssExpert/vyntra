"use client";

import { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { BLOCK_META } from "@/lib/themes/shopingo/blockDefaults";
import type { TypedBlock } from "@/lib/themes/types";

interface Props {
  block: TypedBlock | null;
  onSave: (block: TypedBlock) => void;
  onClose: () => void;
}

function validateJson(value: string): { ok: boolean; data?: unknown; error?: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function BlockConfigPanel({ block, onSave, onClose }: Props) {
  const [jsonValue, setJsonValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (block) {
      setJsonValue(JSON.stringify(block.data, null, 2));
      setError(null);
    }
  }, [block]);

  if (!block) {
    return (
      <aside className="w-80 flex-shrink-0 border-l border-border bg-muted/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center px-6">
          Click a block in the palette or select one on the canvas to configure it.
        </p>
      </aside>
    );
  }

  const meta = BLOCK_META[block.type];

  function handleSave() {
    const result = validateJson(jsonValue);
    if (!result.ok) {
      setError(result.error ?? "Invalid JSON");
      return;
    }
    setError(null);
    if (!block) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSave({ id: block.id, type: block.type, data: result.data } as any);
  }

  return (
    <aside className="w-80 flex-shrink-0 border-l border-border bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div>
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{meta.description}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      {/* JSON editor */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Block Data (JSON)</p>
          {error ? (
            <span className="text-[10px] text-red-500 flex items-center gap-1">
              <AlertCircle size={10} /> Invalid JSON
            </span>
          ) : (
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <Check size={10} /> Valid
            </span>
          )}
        </div>
        <textarea
          className="flex-1 w-full font-mono text-[11px] leading-relaxed p-3 rounded border bg-muted/40 text-foreground resize-none outline-none focus:ring-1 focus:ring-orange-400 border-border"
          value={jsonValue}
          onChange={(e) => {
            setJsonValue(e.target.value);
            const r = validateJson(e.target.value);
            setError(r.ok ? null : (r.error ?? "Invalid JSON"));
          }}
          spellCheck={false}
        />
        {error && (
          <p className="text-[10px] text-red-500 px-1 break-all">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 shrink-0">
        <button
          onClick={handleSave}
          disabled={!!error}
          className="w-full py-2.5 rounded text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "#e4611e" }}
        >
          Save Block
        </button>
      </div>
    </aside>
  );
}
