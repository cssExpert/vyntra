"use client";

import React, { useCallback, useMemo, useState } from "react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Editor } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Copy,
  Trash2,
} from "lucide-react";

export function BlockHandle({ editor }: { editor: Editor }) {
  const [node, setNode] = useState<PMNode | null>(null);
  const [pos, setPos] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);

  // Must be memoized — otherwise the handle re-initializes every render.
  // `interactive: true` is required so the buttons inside are clickable.
  const tippyOptions = useMemo(
    () => ({
      placement: "left-start" as const,
      offset: [0, 4] as [number, number],
      appendTo: () => document.body,
      zIndex: 40,
      interactive: true,
    }),
    [],
  );

  // Insert an empty paragraph below the current block and open the slash menu
  // by typing "/" into it.
  const openSlashBelow = useCallback(() => {
    if (!node || pos < 0) return;
    const after = pos + node.nodeSize;
    editor
      .chain()
      .insertContentAt(after, { type: "paragraph" })
      .focus(after + 1)
      .insertContent("/")
      .run();
    setMenuOpen(false);
  }, [editor, node, pos]);

  const selectBlock = () => {
    if (pos >= 0) editor.chain().focus().setNodeSelection(pos).run();
  };

  const turnInto = (apply: (e: Editor) => void) => {
    if (pos < 0) return;
    editor.chain().focus().setNodeSelection(pos).run();
    apply(editor);
    setMenuOpen(false);
  };

  const duplicate = () => {
    if (!node || pos < 0) return;
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, node.toJSON())
      .run();
    setMenuOpen(false);
  };

  const remove = () => {
    if (!node || pos < 0) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run();
    setMenuOpen(false);
  };

  // Must be stable — DragHandle re-registers its plugin whenever this changes.
  const handleNodeChange = useCallback(
    (data: { node: PMNode | null; pos: number }) => {
      setNode(data.node);
      setPos(data.pos);
      setMenuOpen(false);
    },
    [],
  );

  return (
    <DragHandle
      editor={editor}
      tippyOptions={tippyOptions}
      onNodeChange={handleNodeChange}
    >
      <div className="relative flex items-center gap-0.5 pr-1 !border-0">
        {/* Insert block below — opens the slash command menu */}
        <button
          type="button"
          title="Insert block ( / )"
          onClick={openSlashBelow}
          className="group h-6 w-5 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer !border-0"
        >
          <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4" />
        </button>

        {/* Drag handle — hold to drag, click for options */}
        <button
          type="button"
          title="Hold to drag, click for options"
          onClick={() => {
            selectBlock();
            setMenuOpen((o) => !o);
          }}
          className="h-6 w-4 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-grab active:cursor-grabbing  !border-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Options menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -6, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -6, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-full top-0 ml-1 w-44 rounded-xl border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.16)] p-1.5 z-50"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Turn into
              </p>
              <MenuItem
                icon={Type}
                label="Text"
                onClick={() =>
                  turnInto((e) => e.chain().focus().setParagraph().run())
                }
              />
              <MenuItem
                icon={Heading1}
                label="Heading 1"
                onClick={() =>
                  turnInto((e) =>
                    e.chain().focus().setHeading({ level: 1 }).run(),
                  )
                }
              />
              <MenuItem
                icon={Heading2}
                label="Heading 2"
                onClick={() =>
                  turnInto((e) =>
                    e.chain().focus().setHeading({ level: 2 }).run(),
                  )
                }
              />
              <MenuItem
                icon={Heading3}
                label="Heading 3"
                onClick={() =>
                  turnInto((e) =>
                    e.chain().focus().setHeading({ level: 3 }).run(),
                  )
                }
              />
              <div className="my-1 border-t border-border" />
              <MenuItem icon={Copy} label="Duplicate" onClick={duplicate} />
              <MenuItem icon={Trash2} label="Delete" danger onClick={remove} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DragHandle>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Type;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
        danger
          ? "text-rose-600 hover:bg-rose-500/10"
          : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </button>
  );
}
