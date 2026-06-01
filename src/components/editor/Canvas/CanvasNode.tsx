"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  Copy,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  Pin,
} from "lucide-react";
import type { EditorNode } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

interface CanvasNodeProps {
  node: EditorNode;
  isRoot?: boolean;
  index?: number;
  isDragActive?: boolean;
}

function BesideZone({
  nodeId,
  side,
}: {
  nodeId: string;
  side: "left" | "right";
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `beside-${side}-${nodeId}`,
    data: { type: "BESIDE", nodeId, side },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute inset-y-0 w-1/3 z-20 transition-all duration-150",
        side === "left" ? "left-0" : "right-0",
        isOver
          ? side === "left"
            ? "bg-linear-to-r from-primary/20 dark:from-primary/15 to-transparent"
            : "bg-linear-to-l from-primary/20 dark:from-primary/15 to-transparent"
          : "bg-transparent",
      )}
    >
      {isOver && (
        <div
          className={cn(
            "absolute inset-y-2 w-0.5 rounded-full bg-primary dark:bg-primary",
            side === "left" ? "left-1" : "right-1",
          )}
        />
      )}
    </div>
  );
}

const VOID_TAGS = new Set([
  "input",
  "textarea",
  "img",
  "br",
  "hr",
  "meta",
  "link",
]);

// Tags that must never be rendered as real HTML elements inside the editor —
// React warns about <script> in JSX and neither <script> nor <style> should
// execute inside a visual canvas. They get a neutral placeholder div instead.
const INERT_TAGS = new Set(["script", "style", "noscript"]);

function isHtmlContent(str: string | undefined): boolean {
  return typeof str === "string" && /<[a-z]/i.test(str);
}

export default function CanvasNode({
  node,
  isRoot = false,
  index,
  isDragActive = false,
}: CanvasNodeProps) {
  const {
    selectedId,
    hoveredId,
    selectNode,
    hoverNode,
    removeNode,
    duplicateNode,
    updateNode,
    showOutlines,
    nodes,
  } = useEditorStore();

  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id && !isSelected;
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [nodeRect, setNodeRect] = useState<DOMRect | null>(null);
  const [canvasBounds, setCanvasBounds] = useState<DOMRect | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `node-${node.id}`,
    data: { type: "NODE", nodeId: node.id },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: { type: "CANVAS_DROP", nodeId: node.id },
  });

  const Tag = node.tag as React.ElementType;
  const isVoid = VOID_TAGS.has(node.tag);
  const hasChildren = !isVoid && node.children !== undefined;
  // Only leaf nodes with text content are editable
  const canEdit = !isVoid && !hasChildren && node.content !== undefined;

  // Render an inert placeholder for tags React must not emit as real elements.
  if (INERT_TAGS.has(node.tag)) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[11px] bg-muted dark:bg-foreground text-muted-foreground dark:text-muted-foreground border border-dashed border-border dark:border-border select-none cursor-default",
          isSelected && "outline-2 outline-primary dark:outline-primary",
          isHovered &&
            !isSelected &&
            "outline-1 outline-primary dark:outline-primary/30",
        )}
        onClick={(e) => {
          e.stopPropagation();
          selectNode(node.id);
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          hoverNode(node.id);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          hoverNode(null);
        }}
      >
        <span className="opacity-50">&lt;</span>
        {node.tag}
        <span className="opacity-50">/&gt;</span>
      </div>
    );
  }

  const rootIdx = isRoot ? index : undefined;
  const canMoveUp = isRoot && rootIdx !== undefined && rootIdx > 0;
  const canMoveDown =
    isRoot && rootIdx !== undefined && rootIdx < nodes.length - 1;

  // Track the bounding rect of the outer wrapper for portalled overlays.
  const updateRect = useCallback(() => {
    if (outerRef.current) {
      setNodeRect(outerRef.current.getBoundingClientRect());
      const canvasEl = outerRef.current.closest<HTMLElement>(
        "[data-canvas-scroll]",
      );
      if (canvasEl) setCanvasBounds(canvasEl.getBoundingClientRect());
    }
  }, []);

  useLayoutEffect(() => {
    if (!isSelected || isEditing) {
      //setNodeRect(null);
      return;
    }
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isSelected, isEditing, updateRect]);

  const outlineClass = isDragging
    ? ""
    : isEditing
      ? "outline outline-2 outline-primary dark:outline-primary/60"
      : isOver
        ? "outline outline-2 outline-green-500"
        : isSelected
          ? "outline outline-2 outline-primary dark:outline-primary z-50"
          : isHovered
            ? "outline outline-1 outline-primary dark:outline-primary/30"
            : showOutlines
              ? "outline outline-1 outline-black/6"
              : "";

  // Focus + place cursor at end when editing starts
  useEffect(() => {
    if (!isEditing || !contentRef.current) return;
    const el = contentRef.current;
    el.focus();
    try {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
      // ignore selection errors on void-like elements
    }
  }, [isEditing]);

  const commitEdit = () => {
    if (!isEditing || !contentRef.current) return;
    const content = contentRef.current.textContent ?? "";
    updateNode(node.id, { content });
    setIsEditing(false);
  };

  const nodeProps: Record<string, unknown> = {
    className: cn(
      node.className,
      "relative focus:outline-none",
      isDragging && "opacity-30",
      outlineClass,
      isEditing && "select-text cursor-text",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isEditing) selectNode(node.id);
    },
    onMouseEnter: (e: React.MouseEvent) => {
      e.stopPropagation();
      hoverNode(node.id);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      e.stopPropagation();
      hoverNode(null);
    },
    onDoubleClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canEdit) {
        e.preventDefault();
        selectNode(node.id);
        setIsEditing(true);
      }
    },
    onBlur: () => {
      if (isEditing) commitEdit();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") commitEdit();
      // Prevent Enter from adding a block element inside inline nodes
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commitEdit();
      }
    },
    ref: (el: HTMLElement | null) => {
      setDragRef(el);
      if (hasChildren) setDropRef(el);
      (contentRef as React.MutableRefObject<HTMLElement | null>).current = el;
    },
  };

  const childContent = hasChildren ? (
    <>
      {node.children?.map((child, i) => (
        <CanvasNode
          key={child.id}
          node={child}
          index={i}
          isDragActive={isDragActive}
        />
      ))}
      {isOver && (!node.children || node.children.length === 0) && (
        <div className="border-2 border-dashed border-green-400/50 rounded-lg m-2 p-4 text-center text-green-600/70 text-xs">
          Drop here
        </div>
      )}
    </>
  ) : (
    node.content
  );

  // Clamped toolbar position — derived from state, safe to compute during render
  const TOOLBAR_H = 32;
  const TOOLBAR_W = 220;
  const toolbarTop = nodeRect
    ? canvasBounds && nodeRect.top - TOOLBAR_H - 2 < canvasBounds.top + 4
      ? nodeRect.bottom + 4
      : nodeRect.top - TOOLBAR_H - 2
    : 0;
  const toolbarLeft = nodeRect
    ? Math.max(
        canvasBounds ? canvasBounds.left : 4,
        Math.min(
          nodeRect.left,
          canvasBounds
            ? canvasBounds.right - TOOLBAR_W
            : window.innerWidth - TOOLBAR_W,
        ),
      )
    : 0;
  const addBtnTop = nodeRect
    ? canvasBounds
      ? Math.min(nodeRect.bottom + 8, canvasBounds.bottom - 44)
      : nodeRect.bottom + 8
    : 0;
  const addBtnLeft = nodeRect
    ? canvasBounds
      ? Math.max(
          canvasBounds.left + 4,
          Math.min(
            nodeRect.left + nodeRect.width / 2 - 20,
            canvasBounds.right - 44,
          ),
        )
      : nodeRect.left + nodeRect.width / 2 - 20
    : 0;

  // Hide portal overlays when the node has scrolled outside the canvas bounds
  const isNodeInView =
    nodeRect && canvasBounds
      ? nodeRect.bottom > canvasBounds.top &&
        nodeRect.top < canvasBounds.bottom &&
        nodeRect.right > canvasBounds.left &&
        nodeRect.left < canvasBounds.right
      : true;

  return (
    <div
      ref={outerRef}
      className={cn("relative group/node", isDragging && "z-50")}
    >
      {/* Side drop zones — only on root nodes while dragging */}
      {isRoot && isDragActive && !isDragging && (
        <>
          <BesideZone nodeId={node.id} side="left" />
          <BesideZone nodeId={node.id} side="right" />
        </>
      )}

      {/* Tag label badge */}
      {(isHovered || isSelected) && !isDragging && (
        <div className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.5 rounded-sm z-40 pointer-events-none font-mono leading-tight bg-primary dark:bg-primary text-white dark:text-primary-foreground">
          {node.tag}
        </div>
      )}

      {/* ── Render ── */}
      {isVoid ? (
        <Tag {...(nodeProps as React.HTMLAttributes<HTMLElement>)} />
      ) : isEditing && canEdit ? (
        <Tag
          {...(nodeProps as React.HTMLAttributes<HTMLElement>)}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: node.content ?? "" }}
        />
      ) : isHtmlContent(node.content) ? (
        <Tag
          {...(nodeProps as React.HTMLAttributes<HTMLElement>)}
          dangerouslySetInnerHTML={{ __html: node.content! }}
        />
      ) : (
        <Tag {...(nodeProps as React.HTMLAttributes<HTMLElement>)}>
          {childContent}
        </Tag>
      )}

      {/* ── Portalled overlays (escape any interactive parent in the DOM) ── */}
      {typeof window !== "undefined" &&
        isSelected &&
        !isEditing &&
        nodeRect &&
        isNodeInView &&
        createPortal(
          <>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: "absolute",
                top: toolbarTop,
                left: toolbarLeft,
              }}
              className="z-40 flex items-center rounded-md shadow-lg overflow-hidden bg-primary dark:bg-primary"
            >
              {isRoot && (
                <>
                  <button
                    disabled={!canMoveUp}
                    className="p-1.5 disabled:opacity-30 transition-opacity text-white dark:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canMoveUp && rootIdx !== undefined)
                        useEditorStore
                          .getState()
                          .reorderNodes(node.id, nodes[rootIdx - 1].id);
                    }}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={!canMoveDown}
                    className="p-1.5 disabled:opacity-30 transition-opacity text-white dark:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canMoveDown && rootIdx !== undefined)
                        useEditorStore
                          .getState()
                          .reorderNodes(node.id, nodes[rootIdx + 1].id);
                    }}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </>
              )}
              <div
                className="p-1.5 cursor-grab active:cursor-grabbing text-white dark:text-primary-foreground"
                {...listeners}
                {...attributes}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                className="p-1.5 transition-opacity hover:opacity-70 text-white dark:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateNode(node.id);
                }}
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                className="p-1.5 transition-opacity hover:opacity-70 text-white dark:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                title="Pin"
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                className="p-1.5 hover:bg-red-500/20 transition-colors text-white dark:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>

            {/* Bottom-center Add Block button — root blocks only */}
            {isRoot && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                title="Add block"
                style={{
                  position: "absolute",
                  top: addBtnTop,
                  left: addBtnLeft,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  useEditorStore.getState().setBlockPickerOpen(true);
                }}
                className="z-40 w-10 h-10 rounded-full flex items-center justify-center
                    bg-primary dark:bg-primary text-white dark:text-primary-foreground
                    shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            )}
          </>,
          document.body,
        )}
    </div>
  );
}
