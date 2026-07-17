"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import UnderlineExt from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Sketch } from "@uiw/react-color";
import {
  ChevronDown,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Preset swatches — same set as the Settings colour pickers. */
const SWATCH_PRESETS = [
  "#F76235",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#000000",
  "#ffffff",
];

/**
 * Shared pill styling. Buttons carry no fixed height — they stretch to fill
 * their group's height (set on the group container), so text and icon buttons
 * always match.
 */
const pill = (active?: boolean) =>
  cn(
    "inline-flex items-center justify-center text-sm font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-background text-muted-foreground hover:text-foreground",
  );

/** One height for every top-level toolbar item. */
const GROUP =
  "inline-flex h-8 items-stretch rounded-lg border border-border overflow-hidden";

export interface FormRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Show the P / H1 / H2 / H3 block-style toggles (main paragraph only). */
  withHeadings?: boolean;
}

/**
 * Minimal rich-text editor for the forms "Paragraph" block — headings, Bold,
 * Italic, Underline, lists and a colour picker (the same @uiw/react-color
 * Sketch used on the Settings pages), styled as segmented pills.
 */
export function FormRichTextEditor({
  value,
  onChange,
  withHeadings = false,
}: FormRichTextEditorProps) {
  const [colorOpen, setColorOpen] = useState(false);
  // Popover position — flips above the trigger when space below is tight.
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      TextStyle,
      Color,
      UnderlineExt,
      Placeholder.configure({ placeholder: "Write formatted text…" }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "tiptap focus:outline-none min-h-[72px] px-3.5 py-2.5 text-sm leading-relaxed",
      },
    },
  });

  // Sync externally-loaded content into the editor. useEditor only applies
  // `content` once at mount, so a saved form that loads asynchronously (edit
  // page) would otherwise render empty. Skip while focused to avoid clobbering
  // in-progress typing.
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (!editor.isFocused && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  const activeColor = editor?.getAttributes("textStyle")?.color as
    | string
    | undefined;

  const toggleColor = () => {
    if (!colorOpen && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const right = window.innerWidth - r.right;
      // Sketch picker is ~300px tall; open upward when it won't fit below.
      if (window.innerHeight - r.bottom >= 320) {
        setCoords({ top: r.bottom + 6, bottom: undefined, right });
      } else {
        setCoords({
          top: undefined,
          bottom: window.innerHeight - r.top + 6,
          right,
        });
      }
    }
    setColorOpen((p) => !p);
  };

  useEffect(() => {
    if (!colorOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        popoverRef.current &&
        !popoverRef.current.contains(t)
      ) {
        setColorOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [colorOpen]);

  /** A toolbar pill button with a tooltip. */
  const TBtn = ({
    tip,
    active,
    onClick,
    className,
    children,
  }: {
    tip: string;
    active?: boolean;
    onClick: () => void;
    className?: string;
    children: ReactNode;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onClick();
          }}
          className={cn(pill(active), className)}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );

  const BLOCKS = [
    {
      tip: "Paragraph",
      label: "P",
      active: editor?.isActive("paragraph"),
      run: () => editor?.chain().focus().setParagraph().run(),
    },
    {
      tip: "Heading 1",
      label: "H1",
      active: editor?.isActive("heading", { level: 1 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      tip: "Heading 2",
      label: "H2",
      active: editor?.isActive("heading", { level: 2 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      tip: "Heading 3",
      label: "H3",
      active: editor?.isActive("heading", { level: 3 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      tip: "Heading 4",
      label: "H4",
      active: editor?.isActive("heading", { level: 4 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-border bg-background overflow-visible focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all">
        {/* Toolbar — darker than the writing area to separate the two */}
        <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border bg-muted/90 flex-wrap rounded-t-lg">
          {/* Block type (P / H1 / H2 / H3) */}
          {withHeadings && (
            <div className={GROUP}>
              {BLOCKS.map((b) => (
                <TBtn
                  key={b.label}
                  tip={b.tip}
                  active={b.active}
                  onClick={b.run}
                  className="px-3 border-r border-border last:border-r-0 font-semibold"
                >
                  {b.label}
                </TBtn>
              ))}
            </div>
          )}

          {/* Bold / Italic / Underline */}
          <div className={GROUP}>
            <TBtn
              tip="Bold"
              active={editor?.isActive("bold")}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className="px-3 font-bold border-r border-border"
            >
              Bold
            </TBtn>
            <TBtn
              tip="Italic"
              active={editor?.isActive("italic")}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className="px-3 italic border-r border-border"
            >
              Italic
            </TBtn>
            <TBtn
              tip="Underline"
              active={editor?.isActive("underline")}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className="px-2.5"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </TBtn>
          </div>

          {/* Lists */}
          <div className={GROUP}>
            <TBtn
              tip="Bullet list"
              active={editor?.isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className="px-2.5 border-r border-border"
            >
              <List className="w-3.5 h-3.5" />
            </TBtn>
            <TBtn
              tip="Numbered list"
              active={editor?.isActive("orderedList")}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className="px-2.5"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </TBtn>
          </div>

          {/* Colour picker (Settings' Sketch) */}
          <div ref={triggerRef} className="shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={toggleColor}
                  className={cn(
                    "h-8 inline-flex items-center gap-2 rounded-lg border px-3 text-sm font-medium text-foreground transition-colors shrink-0",
                    colorOpen
                      ? "border-primary bg-muted"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-border/60"
                    style={{ backgroundColor: activeColor || "#111827" }}
                  />
                  Color
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-muted-foreground transition-transform duration-150",
                      colorOpen && "rotate-180",
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>Text colour</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <EditorContent editor={editor} />
      </div>

      {/* Portal — escapes the card's overflow and stacking contexts */}
      {colorOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              ...(coords.top !== undefined ? { top: coords.top } : {}),
              ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
              right: coords.right,
              zIndex: 9999,
            }}
            className="drop-shadow-xl rounded-md overflow-hidden border border-border"
          >
            <Sketch
              color={activeColor || "#111827"}
              presetColors={SWATCH_PRESETS}
              onChange={(c) => editor?.chain().focus().setColor(c.hex).run()}
              style={
                {
                  "--sketch-background": "hsl(var(--card))",
                } as React.CSSProperties
              }
            />
          </div>,
          document.body,
        )}
    </TooltipProvider>
  );
}
