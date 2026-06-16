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
import { ExternalLink, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import { cmsPages } from "@/lib/api";
import { COMPONENT_BLOCKS } from "@/lib/componentBlocks";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Canvas from "./Canvas";
import RightSidebar from "./RightSidebar";
import BlockPickerModal from "./BlockPickerModal";
import { SaveComponentModal } from "./modals/SaveComponentModal";
import { SaveSectionModal } from "./modals/SaveSectionModal";
import { CreateBrandKitModal } from "./modals/CreateBrandKitModal";
import { AddGlobalElementModal } from "./modals/AddGlobalElementModal";

const TemplatePicker = dynamic(() => import("./TemplatePicker"), {
  ssr: false,
});
import { nanoid } from "nanoid";
import type { ComponentBlock, EditorNode } from "@/types/editor";

function deepCloneWithNewIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: nanoid(8),
    children: node.children?.map(deepCloneWithNewIds),
  };
}

// When all root nodes are theme blocks, save as TypedBlock[] (BlockRenderer path).
// Mixed/HTML nodes stay as EditorNode[] (NodeRenderer path).
function serializeNodes(nodes: EditorNode[]): string {
  const allTyped =
    nodes.length > 0 &&
    nodes.every((n) => n.type === "typed-block" && n.blockType);
  if (allTyped) {
    return JSON.stringify(
      nodes.map((n) => ({ id: n.id, type: n.blockType, data: n.blockData ?? {} })),
    );
  }
  return JSON.stringify(nodes);
}

type SaveState = "idle" | "saving" | "saved" | "error";

function EditorHeader({
  pageSlug,
  onPublish,
  publishState,
  onSaveDraft,
  draftState,
  isLandingPage,
}: {
  pageSlug: string | null;
  onPublish: () => void;
  publishState: SaveState;
  onSaveDraft: () => void;
  draftState: SaveState;
  isLandingPage: boolean;
}) {
  const pageTitle = pageSlug
    ? pageSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "New Page";

  const { previewUrl } = useSitePreviewUrl();
  const href = previewUrl(pageSlug ?? undefined) ?? undefined;

  const { previewMode, setPreviewMode } = useEditorStore();

  const publishLabel =
    publishState === "saving"
      ? "Publishing…"
      : publishState === "saved"
        ? "Published ✓"
        : publishState === "error"
          ? "Error — retry"
          : "Publish";

  const draftLabel =
    draftState === "saving"
      ? "Saving…"
      : draftState === "saved"
        ? "Saved ✓"
        : draftState === "error"
          ? "Error"
          : "Save Draft";

  return (
    <header
      className="shrink-0 h-auto flex items-center justify-between px-5 pt-4 z-40
      bg-transparent"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/cms/pages"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Pages
        </Link>
        <span className="text-muted-foreground/30 text-sm select-none">/</span>
        <ThemeToggle />
        <span className="text-sm font-semibold text-foreground">
          {pageTitle}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? "Exit preview" : "Preview page"}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border
              ${previewMode
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent"}`}
          >
            {previewMode ? (
              <><EyeOff className="w-3.5 h-3.5" /> Exit Preview</>
            ) : (
              <><Eye className="w-3.5 h-3.5" /> Preview</>
            )}
          </button>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!href}
            onClick={!href ? (e) => e.preventDefault() : undefined}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors
            ${href ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/40 cursor-not-allowed"}`}
          >
            Preview in new tab
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {!isLandingPage && (
            <button
              onClick={onSaveDraft}
              disabled={draftState === "saving" || publishState === "saving"}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 border
                ${draftState === "saved" ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : draftState === "error" ? "border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/30" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent"}`}
            >
              {draftLabel}
            </button>
          )}
          <button
            onClick={onPublish}
            disabled={publishState === "saving" || draftState === "saving"}
            className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60
              ${publishState === "saved" ? "bg-emerald-600 text-white" : publishState === "error" ? "bg-rose-600 text-white" : "bg-primary hover:bg-primary-600 text-primary-foreground"}`}
          >
            {publishLabel}
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
  const [publishState, setPublishState] = useState<SaveState>("idle");
  const [draftState, setDraftState] = useState<SaveState>("idle");
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [layoutId, setLayoutId] = useState<string | null>(
    searchParams.get("layoutId") || null,
  );

  const {
    addNode,
    reorderNodes,
    selectNode,
    wrapInRow,
    blockPickerOpen,
    setBlockPickerOpen,
    showTemplatePicker,
    setShowTemplatePicker,
    clearCanvas,
    setThemeIdentifier,
  } = useEditorStore();

  // On mount: load pending theme nodes, OR load saved page content, OR show picker
  useEffect(() => {
    const { pendingNodes, setPendingNodes } = useEditorStore.getState();
    if (pendingNodes && pendingNodes.length > 0) {
      clearCanvas();
      pendingNodes.map(deepCloneWithNewIds).forEach((node) => addNode(node));
      setPendingNodes(null);
      setShowTemplatePicker(false);
      return;
    }
    if (isEditingExisting && pageSlug) {
      cmsPages
        .load(pageSlug)
        .then((page) => {
          if (page.isLandingPage) setIsLandingPage(true);
          if (page.layoutId) setLayoutId(page.layoutId);
          if (page.themeIdentifier) setThemeIdentifier(page.themeIdentifier);
          if (page.content) {
            try {
              const parsed = JSON.parse(page.content);
              if (Array.isArray(parsed) && parsed.length > 0) {
                clearCanvas();
                // Detect TypedBlock[] format (installed by theme installer):
                // { id, type: "hero-carousel", data: {...} }
                // Convert to typed-block EditorNodes so the editor can display them.
                const isTypedBlockArray =
                  typeof parsed[0]?.type === "string" &&
                  typeof parsed[0]?.id === "string" &&
                  "data" in parsed[0];

                const nodes: EditorNode[] = isTypedBlockArray
                  ? parsed.map((b: { id: string; type: string; data: Record<string, unknown> }) => ({
                      id: b.id,
                      type: "typed-block",
                      tag: "div",
                      className: "",
                      blockType: b.type,
                      blockData: b.data,
                    }))
                  : parsed;

                nodes.forEach((node) => addNode(node));
                setShowTemplatePicker(false);
                return;
              }
            } catch {
              // content is legacy HTML — leave canvas blank so user can rebuild
            }
          }
          // Page exists but has no editor nodes (legacy HTML or empty) — don't show picker
          setShowTemplatePicker(false);
        })
        .catch(() => setShowTemplatePicker(true));
      return;
    }
    setShowTemplatePicker(!isEditingExisting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePublish = useCallback(async () => {
    if (!pageSlug) return;
    const { nodes } = useEditorStore.getState();
    setPublishState("saving");
    try {
      await cmsPages.save(pageSlug, {
        content: serializeNodes(nodes),
        publish: true,
        layoutId,
      });
      setPublishState("saved");
      setTimeout(() => setPublishState("idle"), 2500);
    } catch {
      setPublishState("error");
      setTimeout(() => setPublishState("idle"), 3000);
    }
  }, [pageSlug, layoutId]);

  const handleSaveDraft = useCallback(async () => {
    if (!pageSlug) return;
    const { nodes } = useEditorStore.getState();
    setDraftState("saving");
    try {
      await cmsPages.save(pageSlug, {
        content: serializeNodes(nodes),
        publish: false,
        layoutId,
      });
      setDraftState("saved");
      setTimeout(() => setDraftState("idle"), 2500);
    } catch {
      setDraftState("error");
      setTimeout(() => setDraftState("idle"), 3000);
    }
  }, [pageSlug, layoutId]);

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

    if (activeData.type === "THEME_BLOCK") {
      const newNode: EditorNode = {
        id: nanoid(8),
        type: "typed-block",
        tag: "div",
        className: "",
        blockType: activeData.blockType as string,
        blockData: activeData.blockData as Record<string, unknown>,
      };
      if (overData?.type === "INSERT_ZONE") {
        addNode(newNode, undefined, overData.index as number);
      } else {
        addNode(newNode);
      }
      return;
    }

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
            <EditorHeader
              pageSlug={pageSlug}
              onPublish={handlePublish}
              publishState={publishState}
              onSaveDraft={handleSaveDraft}
              draftState={draftState}
              isLandingPage={isLandingPage}
            />
            <Canvas />
            <BottomToolbar />
          </div>
          <RightSidebar layoutId={layoutId} onLayoutChange={setLayoutId} />
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

      {/* Library modals — all mounted here to escape sidebar overflow-hidden stacking context */}
      <SaveComponentModal />
      <SaveSectionModal />
      <CreateBrandKitModal />
      <AddGlobalElementModal />

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
