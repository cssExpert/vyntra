"use client";

import { useRef, Fragment } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Tablet, Smartphone, MousePointer2, Plus } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import CanvasNode from "./CanvasNode";
import { cn } from "@/lib/utils";
import AddressBar from "./AddressBar";

const CANVAS_WIDTHS = {
  desktop: "w-full max-w-none",
  tablet: "w-[768px]",
  mobile: "w-[390px]",
};

function InsertZone({ index }: { index: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `insert-${index}`,
    data: { type: "INSERT_ZONE", index },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mx-3 my-1 h-10 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-150",
        isOver
          ? "border-primary dark:border-primary bg-primary/10 dark:bg-primary/10"
          : "border-border dark:border-border",
      )}
    >
      <span
        className={cn(
          "text-xs font-medium pointer-events-none transition-colors duration-150",
          isOver
            ? "text-primary dark:text-primary"
            : "text-muted-foreground dark:text-muted-foreground",
        )}
      >
        Drop here
      </span>
    </div>
  );
}

export default function Canvas() {
  const { nodes, responsiveMode, selectNode, showGrid } = useEditorStore();
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const { active } = useDndContext();
  const isDragActive = active?.data.current?.type === "BLOCK";
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: { type: "CANVAS_ROOT" },
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-trnsparent">
      <div className="flex-1 flex overflow-hidden px-8 py-5">
        <div
          className={cn(
            "relative flex flex-col transition-all mx-auto duration-300 w-full rounded-xl overflow-hidden",
            CANVAS_WIDTHS[responsiveMode],
            responsiveMode !== "desktop" && "shadow-2xl",
          )}
        >
          <div
            ref={(el) => {
              setNodeRef(el);
              canvasRef.current = el;
            }}
            className={cn(
              "flex-1 flex flex-col bg-card dark:bg-muted rounded-xl overflow-hidden relative border border-border dark:border-border",
              showGrid && "bg-grid-pattern",
              isOver &&
                nodes.length === 0 &&
                "outline outline-primary dark:outline-primary -outline-offset-2",
            )}
            onClick={(e) => {
              if (e.target === canvasRef.current) {
                selectNode(null);
              }
            }}
          >
            {/* Canvas toolbar */}
            <div className="position z-50 shrink-0 bg-muted dark:bg-muted border-b border-border dark:border-border px-3 py-2">
              <CanvasToolbar />
            </div>

            {/* Scrollable content area — the actual page preview, always white
                regardless of the editor theme (blocks are designed for a white page). */}
            <div
              data-canvas-scroll
              className="flex-1 overflow-y-auto bg-card text-gray-900 relative @container"
            >
              {responsiveMode !== "desktop" && (
                <div className="absolute -top-px left-0 right-0 flex justify-end pointer-events-none z-10">
                  <div className="text-[11px] px-3 py-0.5 rounded-t-md font-inter bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground">
                    {responsiveMode === "tablet" ? "768px" : "390px"}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {nodes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
                  >
                    <div
                      className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-colors",
                        isOver
                          ? "bg-primary/10 dark:bg-primary/10"
                          : "bg-muted",
                      )}
                    >
                      {isOver ? (
                        <Plus className="w-8 h-8 text-primary dark:text-primary" />
                      ) : (
                        <MousePointer2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1.5">
                      {isOver ? "Drop to add" : "Start building"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Drag blocks from the left panel and drop them here
                    </p>
                  </motion.div>
                ) : (
                  <div className="pt-10 pb-2 px-2 md:px-4">
                    {isDragActive && <InsertZone index={0} />}
                    {nodes.map((node, index) => (
                      <Fragment key={node.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                        >
                          <CanvasNode
                            node={node}
                            isRoot
                            index={index}
                            isDragActive={isDragActive}
                          />
                        </motion.div>
                        {isDragActive && <InsertZone index={index + 1} />}
                      </Fragment>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasToolbar() {
  const { responsiveMode, setResponsiveMode, nodes } = useEditorStore();
  const modes = [
    { id: "desktop" as const, icon: Monitor, label: "Desktop" },
    { id: "tablet" as const, icon: Tablet, label: "Tablet" },
    { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ];
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF4B58]" />
          <div className="w-3 h-3 rounded-full bg-[#FFC600]" />
          <div className="w-3 h-3 rounded-full bg-[#00CA48]" />
        </div>
        <span className="text-xs text-muted-foreground dark:text-muted-foreground hidden @md:block">
          {nodes.length} element{nodes.length !== 1 ? "s" : ""}
        </span>
      </div>
      <AddressBar />
      <div className="flex items-center gap-0.5">
        {modes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setResponsiveMode(id)}
            title={label}
            className={cn(
              "flex w-8 h-8 items-center justify-center rounded-md transition-all",
              responsiveMode === id
                ? "text-primary dark:text-primary"
                : "text-muted-foreground dark:text-muted-foreground",
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
