"use client";

import React, { useCallback } from "react";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CustomImage } from "./CustomImageExtension";
import { ImageUploader } from "./ImageUploaderExtension";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { motion } from "framer-motion";
import { buildMention } from "./mention";
import { buildEmoji } from "./emoji";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
  ChevronDown,
  Baseline,
  Highlighter,
  Check,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel } from "./fields";
import { SlashCommand } from "./slash-command";
import { EditorPopover } from "./EditorPopover";
import { BlockHandle } from "./BlockHandle";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// ─── Palettes (Notion-like) ──────────────────────────────────────────────────

const TEXT_COLORS: { name: string; value: string | null }[] = [
  { name: "Default", value: null },
  { name: "Gray", value: "#6b7280" },
  { name: "Brown", value: "#92400e" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
];

const HIGHLIGHT_COLORS: { name: string; value: string | null }[] = [
  { name: "None", value: null },
  { name: "Gray", value: "#e5e7eb" },
  { name: "Brown", value: "#f5e6d3" },
  { name: "Red", value: "#fee2e2" },
  { name: "Orange", value: "#ffedd5" },
  { name: "Yellow", value: "#fef9c3" },
  { name: "Green", value: "#dcfce7" },
  { name: "Blue", value: "#dbeafe" },
  { name: "Purple", value: "#f3e8ff" },
  { name: "Pink", value: "#fce7f3" },
];

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

// ─── Small UI bits ───────────────────────────────────────────────────────────

function ToolButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function Divider() {
  return <span className="h-4 w-px bg-border mx-0.5" />;
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Enter URL", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().setLink({ href: url }).run();
}

function currentBlockLabel(editor: Editor): string {
  for (const level of HEADING_LEVELS) {
    if (editor.isActive("heading", { level })) return `H${level}`;
  }
  return "Text";
}

// ─── Heading dropdown ─────────────────────────────────────────────────────────

function HeadingMenu({ editor }: { editor: Editor }) {
  return (
    <EditorPopover
      width={180}
      trigger={(open) => (
        <button
          type="button"
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            open
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {currentBlockLabel(editor)}
          <ChevronDown className="w-3 h-3" />
        </button>
      )}
    >
      {(close) => (
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              close();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
          >
            <span>Text</span>
            {editor.isActive("paragraph") && (
              <Check className="w-3.5 h-3.5 text-primary" />
            )}
          </button>
          {HEADING_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                editor.chain().focus().setHeading({ level }).run();
                close();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <span
                className="text-foreground font-bold"
                style={{ fontSize: `${1.15 - level * 0.07}rem` }}
              >
                Heading {level}
              </span>
              {editor.isActive("heading", { level }) && (
                <Check className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </EditorPopover>
  );
}

// ─── Color / highlight pickers ────────────────────────────────────────────────

function Swatches({
  colors,
  onPick,
  type,
}: {
  colors: { name: string; value: string | null }[];
  onPick: (value: string | null) => void;
  type: "text" | "highlight";
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          title={c.name}
          onClick={() => onPick(c.value)}
          className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110"
          style={
            type === "highlight"
              ? { backgroundColor: c.value ?? "transparent" }
              : { color: c.value ?? "hsl(var(--foreground))" }
          }
        >
          {type === "text" ? "A" : c.value ? "" : "✕"}
        </button>
      ))}
    </div>
  );
}

function ColorMenu({ editor }: { editor: Editor }) {
  return (
    <EditorPopover
      width={200}
      trigger={(open) => (
        <button
          type="button"
          title="Text color"
          className={`p-1.5 rounded-md transition-colors ${
            open
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Baseline className="w-3.5 h-3.5" />
        </button>
      )}
    >
      {(close) => (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Text color
          </p>
          <Swatches
            type="text"
            colors={TEXT_COLORS}
            onPick={(value) => {
              if (value) editor.chain().focus().setColor(value).run();
              else editor.chain().focus().unsetColor().run();
              close();
            }}
          />
        </div>
      )}
    </EditorPopover>
  );
}

function HighlightMenu({ editor }: { editor: Editor }) {
  return (
    <EditorPopover
      width={200}
      trigger={(open) => (
        <button
          type="button"
          title="Highlight"
          className={`p-1.5 rounded-md transition-colors ${
            open
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>
      )}
    >
      {(close) => (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Highlight
          </p>
          <Swatches
            type="highlight"
            colors={HIGHLIGHT_COLORS}
            onPick={(value) => {
              if (value)
                editor.chain().focus().setHighlight({ color: value }).run();
              else editor.chain().focus().unsetHighlight().run();
              close();
            }}
          />
        </div>
      )}
    </EditorPopover>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or start writing…",
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CustomImage,
      ImageUploader,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      buildMention(),
      buildEmoji(),
      SlashCommand,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "tiptap focus:outline-none min-h-[340px] pl-12 pr-4 py-4 text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const handleLink = useCallback(() => {
    if (editor) setLink(editor);
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-border bg-background min-h-[400px] animate-pulse" />
    );
  }

  const charCount = editor.getText().length;

  return (
    <div className="space-y-2">
      <FieldLabel>Article Content</FieldLabel>

      <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all">
        {/* Toolbar */}
        <div className="px-2 py-1.5 border-b border-border bg-muted/40 flex flex-wrap items-center gap-0.5">
          <HeadingMenu editor={editor} />
          <Divider />
          <ToolButton
            icon={Bold}
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolButton
            icon={Italic}
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolButton
            icon={UnderlineIcon}
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolButton
            icon={Strikethrough}
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <ColorMenu editor={editor} />
          <HighlightMenu editor={editor} />
          <Divider />
          <ToolButton
            icon={List}
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolButton
            icon={ListOrdered}
            label="Ordered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolButton
            icon={ListChecks}
            label="To-do list"
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          />
          <ToolButton
            icon={Quote}
            label="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolButton
            icon={Code}
            label="Code block"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
          <ToolButton
            icon={LinkIcon}
            label="Link"
            active={editor.isActive("link")}
            onClick={handleLink}
          />
          <Divider />
          <ToolButton
            icon={Undo2}
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolButton
            icon={Redo2}
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>

        {/* Bubble menu — text selections only, never when an image node is active */}
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: e, state }) => {
            if (e.isActive("image") || e.isActive("imageUploader")) return false;
            const { from, to } = state.selection;
            return from !== to;
          }}
          tippyOptions={{ duration: 120, animation: false }}
        >
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="flex items-center gap-0.5 p-1 rounded-lg border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
          >
            <ToolButton
              icon={Bold}
              label="Bold"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolButton
              icon={Italic}
              label="Italic"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolButton
              icon={UnderlineIcon}
              label="Underline"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <ToolButton
              icon={Strikethrough}
              label="Strikethrough"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <ToolButton
              icon={Code}
              label="Inline code"
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
            />
            <Divider />
            <ColorMenu editor={editor} />
            <HighlightMenu editor={editor} />
            <ToolButton
              icon={LinkIcon}
              label="Link"
              active={editor.isActive("link")}
              onClick={handleLink}
            />
          </motion.div>
        </BubbleMenu>

        <BlockHandle editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
        <span>Type &lsquo;/&rsquo; for commands · select text to format</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
}
