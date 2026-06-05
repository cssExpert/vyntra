"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough,
  Underline as UnderlineIcon,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Baseline, Highlighter, ChevronDown,
  Undo2, Redo2, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEXT_COLORS: { name: string; value: string | null }[] = [
  { name: "Default", value: null },
  { name: "Gray",    value: "#6b7280" },
  { name: "Red",     value: "#dc2626" },
  { name: "Orange",  value: "#ea580c" },
  { name: "Yellow",  value: "#ca8a04" },
  { name: "Green",   value: "#16a34a" },
  { name: "Blue",    value: "#2563eb" },
  { name: "Purple",  value: "#9333ea" },
  { name: "Pink",    value: "#db2777" },
];

const HIGHLIGHT_COLORS: { name: string; value: string | null }[] = [
  { name: "None",   value: null },
  { name: "Yellow", value: "#fef9c3" },
  { name: "Green",  value: "#dcfce7" },
  { name: "Blue",   value: "#dbeafe" },
  { name: "Purple", value: "#f3e8ff" },
  { name: "Pink",   value: "#fce7f3" },
  { name: "Orange", value: "#ffedd5" },
  { name: "Gray",   value: "#e5e7eb" },
];

function TBtn({ icon: Icon, title, active, onClick }: {
  icon: LucideIcon; title: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "p-1.5 rounded-md transition-colors shrink-0",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function TDiv() {
  return <span className="h-4 w-px bg-border mx-0.5 shrink-0" />;
}

function Swatches({ colors, mode, onPick }: {
  colors: { name: string; value: string | null }[];
  mode: "text" | "bg";
  onPick: (v: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          title={c.name}
          onMouseDown={(e) => { e.preventDefault(); onPick(c.value); }}
          className="h-6 w-6 rounded-sm border border-border/40 flex items-center justify-center text-[11px] font-bold hover:scale-110 transition-transform"
          style={mode === "bg"
            ? { backgroundColor: c.value ?? "transparent" }
            : { color: c.value ?? "inherit", backgroundColor: "transparent" }
          }
        >
          {mode === "text" ? "A" : !c.value ? "✕" : null}
        </button>
      ))}
    </div>
  );
}

export interface ProductDescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function ProductDescriptionEditor({ value, onChange }: ProductDescriptionEditorProps) {
  const [colorOpen,     setColorOpen]     = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [headingOpen,   setHeadingOpen]   = useState(false);

  const closeAll = () => { setColorOpen(false); setHighlightOpen(false); setHeadingOpen(false); };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      UnderlineExt,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write your product description here…" }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[200px] px-4 py-3 text-[14px] leading-relaxed",
      },
    },
  });

  const headingLabel = editor?.isActive("heading", { level: 2 }) ? "H2"
    : editor?.isActive("heading", { level: 3 }) ? "H3"
    : editor?.isActive("heading", { level: 4 }) ? "H4"
    : "Text";

  const HEADINGS = [
    { label: "Normal Text", fn: () => editor?.chain().focus().setParagraph().run(), active: editor?.isActive("paragraph") },
    { label: "Heading 2",   fn: () => editor?.chain().focus().setHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
    { label: "Heading 3",   fn: () => editor?.chain().focus().setHeading({ level: 3 }).run(), active: editor?.isActive("heading", { level: 3 }) },
    { label: "Heading 4",   fn: () => editor?.chain().focus().setHeading({ level: 4 }).run(), active: editor?.isActive("heading", { level: 4 }) },
  ];

  return (
    <div
      className="rounded-sm border border-border bg-background overflow-visible focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all"
      onClick={() => { if (colorOpen || highlightOpen || headingOpen) closeAll(); }}
    >
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap rounded-t-sm">

        {/* Heading dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setHeadingOpen((p) => !p); setColorOpen(false); setHighlightOpen(false); }}
            className={cn(
              "flex items-center gap-0.5 px-2 py-1.5 rounded-md text-xs font-semibold min-w-[3rem] transition-colors",
              headingOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {headingLabel} <ChevronDown className="w-3 h-3" />
          </button>
          {headingOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 w-36 bg-popover border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.14)] overflow-hidden">
              {HEADINGS.map(({ label, fn, active }) => (
                <button
                  key={label}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); fn(); setHeadingOpen(false); }}
                  className={cn("w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors", active && "text-primary font-semibold bg-primary/5")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <TDiv />
        <TBtn icon={Bold}          title="Bold"           active={editor?.isActive("bold")}      onClick={() => editor?.chain().focus().toggleBold().run()} />
        <TBtn icon={Italic}        title="Italic"         active={editor?.isActive("italic")}    onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <TBtn icon={UnderlineIcon} title="Underline"      active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <TBtn icon={Strikethrough} title="Strikethrough"  active={editor?.isActive("strike")}    onClick={() => editor?.chain().focus().toggleStrike().run()} />
        <TDiv />

        {/* Text color */}
        <div className="relative">
          <button
            type="button"
            title="Text color"
            onMouseDown={(e) => { e.preventDefault(); setColorOpen((p) => !p); setHighlightOpen(false); setHeadingOpen(false); }}
            className={cn("p-1.5 rounded-md transition-colors shrink-0", colorOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          >
            <Baseline className="w-3.5 h-3.5" />
          </button>
          {colorOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 p-2.5 bg-popover border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.14)] w-[156px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Text Color</p>
              <Swatches mode="text" colors={TEXT_COLORS} onPick={(v) => { if (v) editor?.chain().focus().setColor(v).run(); else editor?.chain().focus().unsetColor().run(); setColorOpen(false); }} />
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            title="Highlight text"
            onMouseDown={(e) => { e.preventDefault(); setHighlightOpen((p) => !p); setColorOpen(false); setHeadingOpen(false); }}
            className={cn("p-1.5 rounded-md transition-colors shrink-0", (highlightOpen || editor?.isActive("highlight")) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          {highlightOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 p-2.5 bg-popover border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.14)] w-[156px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Highlight</p>
              <Swatches mode="bg" colors={HIGHLIGHT_COLORS} onPick={(v) => { if (v) editor?.chain().focus().setHighlight({ color: v }).run(); else editor?.chain().focus().unsetHighlight().run(); setHighlightOpen(false); }} />
            </div>
          )}
        </div>

        <TDiv />
        <TBtn icon={AlignLeft}    title="Align left"    active={editor?.isActive({ textAlign: "left" })}    onClick={() => editor?.chain().focus().setTextAlign("left").run()} />
        <TBtn icon={AlignCenter}  title="Align center"  active={editor?.isActive({ textAlign: "center" })}  onClick={() => editor?.chain().focus().setTextAlign("center").run()} />
        <TBtn icon={AlignRight}   title="Align right"   active={editor?.isActive({ textAlign: "right" })}   onClick={() => editor?.chain().focus().setTextAlign("right").run()} />
        <TBtn icon={AlignJustify} title="Justify"       active={editor?.isActive({ textAlign: "justify" })} onClick={() => editor?.chain().focus().setTextAlign("justify").run()} />
        <TDiv />
        <TBtn icon={List}        title="Bullet list"    active={editor?.isActive("bulletList")}  onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <TBtn icon={ListOrdered} title="Ordered list"   active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <TBtn icon={Quote}       title="Blockquote"     active={editor?.isActive("blockquote")}  onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <TBtn icon={Minus}       title="Divider line"                                             onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
        <TDiv />
        <TBtn icon={Undo2} title="Undo" onClick={() => editor?.chain().focus().undo().run()} />
        <TBtn icon={Redo2} title="Redo" onClick={() => editor?.chain().focus().redo().run()} />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
