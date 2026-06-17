"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Baseline,
  Highlighter,
  ChevronDown,
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

function TBtn({
  icon: Icon,
  title,
  active,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "p-1.5 rounded-md transition-colors shrink-0",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function TDiv() {
  return <span className="h-4 w-px bg-border mx-0.5 shrink-0" />;
}

function Swatches({
  colors,
  mode,
  onPick,
}: {
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
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(c.value);
          }}
          className="h-6 w-6 rounded-sm border border-border/40 flex items-center justify-center text-[11px] font-bold hover:scale-110 transition-transform"
          style={
            mode === "bg"
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

export function ProductDescriptionEditor({
  value,
  onChange,
}: ProductDescriptionEditorProps) {
  const t = useTranslations("store.products.editor");
  const [colorOpen, setColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);

  const TEXT_COLORS: { name: string; value: string | null }[] = [
    { name: t("colorDefault"), value: null },
    { name: t("colorGray"), value: "#6b7280" },
    { name: t("colorRed"), value: "#dc2626" },
    { name: t("colorOrange"), value: "#ea580c" },
    { name: t("colorYellow"), value: "#ca8a04" },
    { name: t("colorGreen"), value: "#16a34a" },
    { name: t("colorBlue"), value: "#2563eb" },
    { name: t("colorPurple"), value: "#9333ea" },
    { name: t("colorPink"), value: "#db2777" },
  ];

  const HIGHLIGHT_COLORS: { name: string; value: string | null }[] = [
    { name: t("colorNone"), value: null },
    { name: t("colorYellow"), value: "#fef9c3" },
    { name: t("colorGreen"), value: "#dcfce7" },
    { name: t("colorBlue"), value: "#dbeafe" },
    { name: t("colorPurple"), value: "#f3e8ff" },
    { name: t("colorPink"), value: "#fce7f3" },
    { name: t("colorOrange"), value: "#ffedd5" },
    { name: t("colorGray"), value: "#e5e7eb" },
  ];

  const closeAll = () => {
    setColorOpen(false);
    setHighlightOpen(false);
    setHeadingOpen(false);
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      UnderlineExt,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: t("placeholder"),
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "tiptap focus:outline-none min-h-[200px] px-4 py-3 text-[14px] leading-relaxed",
      },
    },
  });

  const HEADINGS = [
    {
      label: t("normalText"),
      fn: () => editor?.chain().focus().setParagraph().run(),
      active: editor?.isActive("paragraph"),
    },
    {
      label: t("heading2"),
      fn: () => editor?.chain().focus().setHeading({ level: 2 }).run(),
      active: editor?.isActive("heading", { level: 2 }),
    },
    {
      label: t("heading3"),
      fn: () => editor?.chain().focus().setHeading({ level: 3 }).run(),
      active: editor?.isActive("heading", { level: 3 }),
    },
    {
      label: t("heading4"),
      fn: () => editor?.chain().focus().setHeading({ level: 4 }).run(),
      active: editor?.isActive("heading", { level: 4 }),
    },
  ];

  return (
    <div
      className="rounded-sm border border-border bg-background overflow-visible focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all"
      onClick={() => {
        if (colorOpen || highlightOpen || headingOpen) closeAll();
      }}
    >
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap rounded-t-sm">
        {/* Heading dropdown */}
        <div className="relative">
          {headingOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 w-36 bg-popover border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.14)] overflow-hidden">
              {HEADINGS.map(({ label, fn, active }) => (
                <button
                  key={label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    fn();
                    setHeadingOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors",
                    active && "text-primary font-semibold bg-primary/5",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <TBtn
          icon={Bold}
          title={t("bold")}
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <TBtn
          icon={Italic}
          title={t("italic")}
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <TBtn
          icon={UnderlineIcon}
          title={t("underline")}
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <TBtn
          icon={Strikethrough}
          title={t("strikethrough")}
          active={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <TDiv />

        {/* Text color */}
        <div className="relative">
          <button
            type="button"
            title={t("textColorTitle")}
            onMouseDown={(e) => {
              e.preventDefault();
              setColorOpen((p) => !p);
              setHighlightOpen(false);
              setHeadingOpen(false);
            }}
            className={cn(
              "p-1.5 rounded-md transition-colors shrink-0",
              colorOpen
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Baseline className="w-3.5 h-3.5" />
          </button>
          {colorOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 p-2.5 bg-popover border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.14)] w-[156px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t("textColor")}
              </p>
              <Swatches
                mode="text"
                colors={TEXT_COLORS}
                onPick={(v) => {
                  if (v) editor?.chain().focus().setColor(v).run();
                  else editor?.chain().focus().unsetColor().run();
                  setColorOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            title={t("highlightTitle")}
            onMouseDown={(e) => {
              e.preventDefault();
              setHighlightOpen((p) => !p);
              setColorOpen(false);
              setHeadingOpen(false);
            }}
            className={cn(
              "p-1.5 rounded-md transition-colors shrink-0",
              highlightOpen || editor?.isActive("highlight")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          {highlightOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 p-2.5 bg-popover border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.14)] w-[156px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t("highlight")}
              </p>
              <Swatches
                mode="bg"
                colors={HIGHLIGHT_COLORS}
                onPick={(v) => {
                  if (v)
                    editor?.chain().focus().setHighlight({ color: v }).run();
                  else editor?.chain().focus().unsetHighlight().run();
                  setHighlightOpen(false);
                }}
              />
            </div>
          )}
        </div>

        <TDiv />
        <TBtn
          icon={AlignLeft}
          title={t("alignLeft")}
          active={editor?.isActive({ textAlign: "left" })}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        />
        <TBtn
          icon={AlignCenter}
          title={t("alignCenter")}
          active={editor?.isActive({ textAlign: "center" })}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        />
        <TBtn
          icon={AlignRight}
          title={t("alignRight")}
          active={editor?.isActive({ textAlign: "right" })}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        />
        <TBtn
          icon={AlignJustify}
          title={t("justify")}
          active={editor?.isActive({ textAlign: "justify" })}
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        />
        <TDiv />
        <TBtn
          icon={List}
          title={t("bulletList")}
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <TBtn
          icon={ListOrdered}
          title={t("orderedList")}
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <TBtn
          icon={Minus}
          title={t("dividerLine")}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
        <TDiv />
        <TBtn
          icon={Undo2}
          title={t("undo")}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <TBtn
          icon={Redo2}
          title={t("redo")}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
