"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { motion } from "framer-motion";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Minus,
  ImageIcon,
  Table as TableIcon,
  AtSign,
  Smile,
  type LucideIcon,
} from "lucide-react";

type CommandGroup = "Styles" | "Upload" | "Insert";

interface CommandItem {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  group: CommandGroup;
  keywords?: string[];
  run: (props: { editor: Editor; range: Range }) => void;
}

// Inserts the dropzone/upload placeholder node into the editor.
function insertImageUploader(editor: Editor, range: Range) {
  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContentAt(range.from, { type: "imageUploader" })
    .run();
}

const COMMANDS: CommandItem[] = [
  // ── Styles ──────────────────────────────────────────────
  {
    title: "Text",
    subtitle: "Plain paragraph",
    icon: Type,
    group: "Styles",
    keywords: ["paragraph", "body"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    subtitle: "Big section heading",
    icon: Heading1,
    group: "Styles",
    keywords: ["h1", "title"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    subtitle: "Medium section heading",
    icon: Heading2,
    group: "Styles",
    keywords: ["h2"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    subtitle: "Small section heading",
    icon: Heading3,
    group: "Styles",
    keywords: ["h3"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Heading 4",
    subtitle: "Sub heading",
    icon: Heading4,
    group: "Styles",
    keywords: ["h4"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run(),
  },
  {
    title: "Heading 5",
    subtitle: "Sub heading",
    icon: Heading5,
    group: "Styles",
    keywords: ["h5"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 5 }).run(),
  },
  {
    title: "Heading 6",
    subtitle: "Smallest heading",
    icon: Heading6,
    group: "Styles",
    keywords: ["h6"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 6 }).run(),
  },
  {
    title: "Bullet List",
    subtitle: "Simple bulleted list",
    icon: List,
    group: "Styles",
    keywords: ["unordered", "ul"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    subtitle: "Ordered list",
    icon: ListOrdered,
    group: "Styles",
    keywords: ["ordered", "ol"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "To-do List",
    subtitle: "Track tasks with checkboxes",
    icon: ListChecks,
    group: "Styles",
    keywords: ["task", "todo", "checkbox"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    subtitle: "Capture a quotation",
    icon: Quote,
    group: "Styles",
    keywords: ["blockquote"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    subtitle: "Formatted code snippet",
    icon: Code,
    group: "Styles",
    keywords: ["pre", "snippet"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },

  // ── Upload ──────────────────────────────────────────────
  {
    title: "Image",
    subtitle: "Upload an image from your device",
    icon: ImageIcon,
    group: "Upload",
    keywords: ["photo", "picture", "upload"],
    run: ({ editor, range }) => insertImageUploader(editor, range),
  },

  // ── Insert ──────────────────────────────────────────────
  {
    title: "Table",
    subtitle: "Insert a 3 × 3 table",
    icon: TableIcon,
    group: "Insert",
    keywords: ["grid", "rows", "columns"],
    run: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Mention",
    subtitle: "Mention a person with @",
    icon: AtSign,
    group: "Insert",
    keywords: ["person", "user", "tag"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertContent("@").run(),
  },
  {
    title: "Emoji",
    subtitle: "Insert an emoji with :",
    icon: Smile,
    group: "Insert",
    keywords: ["emoticon", "smiley", "react"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertContent(":").run(),
  },
  {
    title: "Separator",
    subtitle: "Horizontal rule",
    icon: Minus,
    group: "Insert",
    keywords: ["hr", "line", "divider"],
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

// ─── React menu rendered by the suggestion plugin ────────────────────────────

interface SlashMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const SlashCommandList = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelected((s) => (s + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((s) => (s + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          if (items[selected]) command(items[selected]);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="w-72 max-h-[300px] overflow-y-auto rounded-xl border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.16)] p-0"
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === selected;
          // Render a section header whenever the group changes.
          const showHeader = i === 0 || items[i - 1].group !== item.group;
          return (
            <React.Fragment key={item.title}>
              {showHeader && (
                <span className="sticky top-0 p-0 bg-card block text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5 mb-1 border-b border-border">
                  {item.group}
                </span>
              )}
              <button
                type="button"
                onMouseEnter={() => setSelected(i)}
                onClick={() => command(item)}
                className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-0 text-left transition-colors ${
                  isActive ? "bg-muted" : "hover:bg-muted/60"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="block text-[11px] text-muted-foreground truncate">
                    {item.subtitle}
                  </span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </motion.div>
    );
  },
);
SlashCommandList.displayName = "SlashCommandList";

// ─── The extension ───────────────────────────────────────────────────────────

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion<CommandItem>({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => props.run({ editor, range }),
        items: ({ query }) => {
          const q = query.toLowerCase();
          return COMMANDS.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.keywords?.some((k) => k.includes(q)),
          );
        },
        render: () => {
          let component:
            | ReactRenderer<SlashMenuRef, SlashMenuProps>
            | undefined;
          let popup: TippyInstance[] | undefined;

          return {
            onStart: (props) => {
              if (!props.clientRect) return;
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              });
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                animation: false,
              });
            },
            onUpdate: (props) => {
              component?.updateProps(props);
              if (!props.clientRect) return;
              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
              popup = undefined;
              component = undefined;
            },
          };
        },
      }),
    ];
  },
});
