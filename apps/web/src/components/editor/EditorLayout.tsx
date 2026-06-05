"use client";

import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { motion } from "framer-motion";

import dynamic from "next/dynamic";

const LeftSidebar = dynamic(() => import("./LeftSidebar"), {
  ssr: false,
  loading: () => (
    <div className="w-65 h-full animate-pulse bg-muted dark:bg-foreground/50" />
  ),
});
const BottomToolbar = dynamic(() => import("./BottomToolbar"), {
  ssr: false,
});

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { COMPONENT_BLOCKS } from "@/lib/componentBlocks";
import Icon from "@/components/common/Icon";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Canvas from "./Canvas";
import RightSidebar from "./RightSidebar";
import TemplatePicker from "./TemplatePicker";
import BlockPickerModal from "./BlockPickerModal";
import { nanoid } from "nanoid";
import type { ComponentBlock, EditorNode } from "@/types/editor";

function deepCloneWithNewIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: nanoid(8),
    children: node.children?.map(deepCloneWithNewIds),
  };
}

function EditorHeader({ pageSlug }: { pageSlug: string | null }) {
  const pageTitle = pageSlug
    ? pageSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "New Page";

  return (
    <header
      className="shrink-0 h-auto flex items-center justify-between px-8 pt-4 z-40
      bg-transparent"
    >
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm font-semibold text-foreground">{pageTitle}</span>
      </div>
      {/* Right actions */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors
            text-muted-foreground hover:text-foreground"
          >
            Preview in new tab
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors
          bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Publish
          </button>
        </div>
      </div>
    </header>
  );
}

function containsNode(node: EditorNode, id: string): boolean {
  if (!node.children) return false;
  return node.children.some((c) => c.id === id || containsNode(c, id));
}

export default function EditorLayout() {
  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("page");
  const isEditingExisting = Boolean(pageSlug);

  const {
    addNode,
    reorderNodes,
    selectNode,
    wrapInRow,
    blockPickerOpen,
    setBlockPickerOpen,
  } = useEditorStore();
  // Skip template picker when editing an existing page; show it only for new pages
  const [showTemplatePicker, setShowTemplatePicker] = useState(!isEditingExisting);

  function handleInsertBlock(block: ComponentBlock) {
    const { nodes, selectedId } = useEditorStore.getState();
    const clone = deepCloneWithNewIds(block.template);

    if (!selectedId) {
      addNode(clone);
      return;
    }

    // Find the root-level index of the selected node (or its ancestor)
    let rootIdx = nodes.findIndex((n) => n.id === selectedId);
    if (rootIdx === -1) {
      rootIdx = nodes.findIndex((n) => containsNode(n, selectedId));
    }

    addNode(clone, undefined, rootIdx !== -1 ? rootIdx + 1 : undefined);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const {
        selectedId,
        removeNode,
        duplicateNode,
        copyNode,
        pasteNode,
        undo,
        redo,
      } = useEditorStore.getState();
      const t = e.target as HTMLElement;
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.contentEditable === "true"
      )
        return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeNode(selectedId);
      } else if (e.key === "Escape") {
        selectNode(null);
      } else if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (selectedId) duplicateNode(selectedId);
      } else if (e.key === "c" && (e.metaKey || e.ctrlKey) && selectedId) {
        copyNode(selectedId);
      } else if (e.key === "v" && (e.metaKey || e.ctrlKey)) {
        pasteNode();
      } else if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) ||
        (e.key === "y" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        redo();
      }
    },
    [selectNode],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;
    if (!activeData) return;

    if (activeData.type === "BLOCK") {
      const block = COMPONENT_BLOCKS.find((b) => `block-${b.id}` === active.id);
      if (!block) return;
      const newNode = deepCloneWithNewIds(block.template);

      if (overData?.type === "INSERT_ZONE") {
        addNode(newNode, undefined, overData.index as number);
      } else if (overData?.type === "BESIDE") {
        wrapInRow(
          overData.nodeId as string,
          newNode,
          (overData.side as string) === "left" ? "before" : "after",
        );
      } else if (over.id === "canvas-root") {
        addNode(newNode);
      } else if (overData?.type === "CANVAS_DROP") {
        addNode(newNode, overData.nodeId as string);
      } else {
        addNode(newNode);
      }
      return;
    }

    if (activeData.type === "NODE") {
      const activeId = activeData.nodeId as string;
      if (typeof over.id === "string" && over.id.startsWith("node-")) {
        const overId = over.id.replace("node-", "");
        if (activeId !== overId) reorderNodes(activeId, overId);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen overflow-hidden bg-muted dark:bg-background">
        <div className="flex flex-1 min-h-0 overflow-hidden select-none">
          <LeftSidebar />
          <div className="flex-1 flex flex-col min-w-0 canvas-container overflow-hidden bg-muted dark:bg-background">
            <EditorHeader pageSlug={pageSlug} />
            <Canvas />
            <BottomToolbar />
          </div>
          <RightSidebar />
        </div>
      </div>

      <TemplatePicker
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
      />
      <BlockPickerModal
        open={blockPickerOpen}
        onClose={() => setBlockPickerOpen(false)}
        onSelect={handleInsertBlock}
      />

      <DragOverlay>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="rounded-lg px-3 py-2 text-xs font-semibold shadow-2xl pointer-events-none
            bg-primary text-white
            dark:bg-primary dark:text-primary-foreground"
        >
          Drop to add
        </motion.div>
      </DragOverlay>
    </DndContext>
  );
}
