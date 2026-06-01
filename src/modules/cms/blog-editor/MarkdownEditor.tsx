"use client";

import React, { useRef } from "react";
import { PenTool, Eye, Info } from "lucide-react";
import { FieldLabel, SegmentedControl } from "./fields";
import { parseMarkdownToHTML } from "./types";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [mode, setMode] = React.useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insert = (before: string, after = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const next =
      value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    }, 30);
  };

  const toolbar: { label: string; cls?: string; before: string; after?: string }[] =
    [
      { label: "B", cls: "font-bold", before: "**", after: "**" },
      { label: "I", cls: "italic", before: "*", after: "*" },
      { label: "H1", before: "# " },
      { label: "H2", before: "## " },
      { label: "Code", cls: "font-mono", before: "`", after: "`" },
      { label: "Link", cls: "underline", before: "[", after: "](https://)" },
    ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Article Content</FieldLabel>
        <SegmentedControl<"write" | "preview">
          value={mode}
          onChange={setMode}
          options={[
            {
              id: "write",
              label: (
                <>
                  <PenTool className="w-3 h-3" /> Editor
                </>
              ),
            },
            {
              id: "preview",
              label: (
                <>
                  <Eye className="w-3 h-3" /> Preview
                </>
              ),
            },
          ]}
        />
      </div>

      {mode === "write" ? (
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          {/* Toolbar */}
          <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {toolbar.map((b, i) => (
              <React.Fragment key={b.label}>
                {(i === 2 || i === 4) && (
                  <span className="h-3.5 w-px bg-border mx-0.5" />
                )}
                <button
                  type="button"
                  onClick={() => insert(b.before, b.after)}
                  className={`px-1.5 py-1 hover:bg-primary/10 hover:text-primary rounded transition-colors ${b.cls ?? ""}`}
                >
                  {b.label}
                </button>
              </React.Fragment>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            rows={14}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your markdown story here…"
            className="w-full p-4 font-mono text-xs leading-relaxed bg-background text-foreground focus:outline-none resize-y"
          />
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-border bg-background min-h-[320px] max-h-[450px] overflow-y-auto">
          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(value) }}
          />
        </div>
      )}

      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Markdown rendering supported
        </span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
