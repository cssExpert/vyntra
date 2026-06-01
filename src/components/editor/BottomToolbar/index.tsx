"use client";

import { useState } from "react";
import {
  Undo2,
  Redo2,
  Trash2,
  Copy,
  ClipboardPaste,
  Code2,
  Download,
  ChevronRight,
  MousePointer2,
  Hand,
  Type,
  Grid2x2Plus,
  X,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
// } from "@/components/ui/drawer";

import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { EditorTool } from "@/types/editor";

// import SectionTitle from "@/components/common/SectionTitle";
import AssetsManagement from "@/components/editor/AssetsManagement";

function buildBreadcrumb(
  nodes: import("@/types/editor").EditorNode[],
  targetId: string,
): import("@/types/editor").EditorNode[] {
  for (const node of nodes) {
    if (node.id === targetId) return [node];
    if (node.children) {
      const path = buildBreadcrumb(node.children, targetId);
      if (path.length > 0) return [node, ...path];
    }
  }
  return [];
}

function generateHTML(
  nodes: import("@/types/editor").EditorNode[],
  indent = 0,
): string {
  const pad = "  ".repeat(indent);
  const voidTags = new Set(["input", "img", "br", "hr", "meta", "link"]);
  return nodes
    .map((node) => {
      const attrs = [
        node.className ? `class="${node.className}"` : "",
        ...Object.entries(node.props || {}).map(([k, v]) => `${k}="${v}"`),
      ]
        .filter(Boolean)
        .join(" ");
      if (voidTags.has(node.tag))
        return `${pad}<${node.tag}${attrs ? " " + attrs : ""} />`;
      const open = `<${node.tag}${attrs ? " " + attrs : ""}>`;
      if (node.children?.length)
        return `${pad}${open}\n${generateHTML(node.children, indent + 1)}\n${pad}</${node.tag}>`;
      return `${pad}${open}${node.content || ""}</${node.tag}>`;
    })
    .join("\n");
}

function IconBtn({
  onClick,
  disabled = false,
  title,
  danger = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        danger
          ? "text-muted-foreground dark:text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
          : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// Assets Modal
function AssetsModal({ onClose }: { onClose: () => void }) {
  const { nodes } = useEditorStore();
  const code = generateHTML(nodes);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-4xl md:max-w-5xl lg:max-w-6xl h-[80vh] flex flex-col shadow-2xl border bg-card border-border dark:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
          <h2 className="font-semibold text-sm md:text-lg md:font-bold flex items-center gap-2 text-foreground dark:text-foreground">
            <Grid2x2Plus className="w-4 h-4 text-primary dark:text-primary" />
            Assets Management
          </h2>
          <button
            onClick={onClose}
            className="group/button text-xl w-7 h-7 flex items-center justify-center leading-none transition-all text-muted-foreground dark:text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 dark:hover:text-foreground rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code */}
        <div className="flex-1 min-h-0 overflow-hidden p-0 bg-muted dark:bg-background text-muted-foreground dark:text-muted-foreground">
          <AssetsManagement />
        </div>

        {/* Footer */}
        <div className="p-4 border-t m-0! border-border dark:border-border flex gap-3 justify-end">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              copied
                ? "bg-green-500 text-black"
                : "bg-primary dark:bg-primary text-white dark:text-primary-foreground hover:bg-primary dark:hover:bg-primary",
            )}
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => {
              const blob = new Blob([code], { type: "text/html" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "page.html";
              a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground
              border border-border dark:border-border
              hover:border-primary dark:hover:border-primary/20 hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Modal
function ExportModal({ onClose }: { onClose: () => void }) {
  const { nodes } = useEditorStore();
  const code = generateHTML(nodes);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl border bg-card border-border dark:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
          <h2 className="font-semibold text-sm md:text-lg md:font-bold flex items-center gap-2 text-foreground dark:text-foreground">
            <Code2 className="w-4 h-4 text-primary dark:text-primary" />
            Export HTML
          </h2>
          <button
            onClick={onClose}
            className="group/button text-xl w-7 h-7 flex items-center justify-center leading-none transition-all text-muted-foreground dark:text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 dark:hover:text-foreground rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs font-mono rounded-xl p-4 overflow-auto bg-muted dark:bg-background text-muted-foreground dark:text-muted-foreground">
            {code || "<!-- No elements on canvas -->"}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border dark:border-border flex gap-3 justify-end">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              copied
                ? "bg-green-500 text-black"
                : "bg-primary dark:bg-primary text-white dark:text-primary-foreground hover:bg-primary dark:hover:bg-primary",
            )}
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => {
              const blob = new Blob([code], { type: "text/html" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "page.html";
              a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground
              border border-border dark:border-border
              hover:border-primary dark:hover:border-primary/20 hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BottomToolbar() {
  const {
    selectedId,
    nodes,
    undo,
    redo,
    canUndo,
    canRedo,
    removeNode,
    copyNode,
    pasteNode,
    clearCanvas,
    activeTool,
    setActiveTool,
    clipboard,
  } = useEditorStore();
  const [showExport, setShowExport] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // const [drawerOpen, setDrawerOpen] = useState(false);
  const breadcrumb = selectedId ? buildBreadcrumb(nodes, selectedId) : [];

  const tools: { id: EditorTool; icon: React.ElementType; label: string }[] = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "hand", icon: Hand, label: "Pan (H)" },
    { id: "text", icon: Type, label: "Text (T)" },
  ];

  return (
    <>
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      {showAssets && <AssetsModal onClose={() => setShowAssets(false)} />}

      {/* Controlled Drawer — no DrawerTrigger wrapper to avoid button-in-button */}
      {/* <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-full">
            <DrawerHeader className="w-full text-start justify-start items-start">
              <SectionTitle
                title="Assets Management"
                paragraph="The <meta> tag defines metadata about an HTML document."
                className="max-w-full"
                width="100%"
              />
              <DrawerTitle className="sr-only">Move Goal</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-0"></div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer> */}

      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border bg-card border-border dark:border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2 text-foreground dark:text-foreground">
              Clear canvas?
            </h3>
            <p className="text-sm mb-5 text-muted-foreground dark:text-muted-foreground">
              All elements will be removed. You can undo this.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm transition-colors
                  bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground
                  border border-border dark:border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCanvas();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 h-10 flex items-center px-3 gap-1 border-t bg-card border-border dark:border-border">
        {/* Tool switcher */}
        <div className="relative flex items-center gap-0 rounded-sm p-0.5 mr-0 bg-muted dark:bg-muted">
          {/* Dynamic Sliding Background */}
          <div
            className="absolute top-0.5 bottom-0.5 left-0.5 w-6 h-6 rounded-sm bg-primary shadow-sm dark:bg-primary transition-transform duration-200 ease-out-quad"
            style={{
              // Dynamically calculate width based on total items
              //width: `calc(${100 / tools.length}% - 0.5px)`,
              width: "24px",
              // Find the index of the active tool to slide it to the right spot
              transform: `translateX(${tools.findIndex((t) => t.id === activeTool) * 100}%)`,
            }}
          />

          {/* Items Mapping */}
          {tools.map(({ id, icon: Icon, label }) => {
            const active = activeTool === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTool(id)}
                title={label}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center w-6 h-6 rounded-sm text-xs font-medium transition-colors duration-200",
                  active
                    ? "text-white dark:text-primary-foreground font-semibold"
                    : "text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-0.5 bg-muted dark:bg-muted" />

        {/* Undo / Redo */}
        <IconBtn onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
          <Redo2 className="w-3.5 h-3.5" />
        </IconBtn>

        {/* Selected actions */}
        {selectedId && (
          <>
            <div className="w-px h-5 mx-0.5 bg-muted dark:bg-muted" />
            <IconBtn onClick={() => copyNode(selectedId)} title="Copy">
              <Copy className="w-3.5 h-3.5" />
            </IconBtn>
            <IconBtn
              onClick={() => removeNode(selectedId)}
              title="Delete"
              danger
            >
              <Trash2 className="w-3.5 h-3.5" />
            </IconBtn>
          </>
        )}
        {clipboard && (
          <IconBtn onClick={() => pasteNode()} title="Paste">
            <ClipboardPaste className="w-3.5 h-3.5" />
          </IconBtn>
        )}

        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-0.5 overflow-hidden mx-2 min-w-0">
          {breadcrumb.length > 0 ? (
            breadcrumb.map((node, i) => (
              <span key={node.id} className="flex items-center gap-0.5 min-w-0">
                {i > 0 && (
                  <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground dark:text-muted-foreground" />
                )}
                <button
                  onClick={() => useEditorStore.getState().selectNode(node.id)}
                  className="text-xs font-mono truncate max-w-18 transition-colors text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary"
                  title={node.type}
                >
                  {node.tag}
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground dark:text-muted-foreground">
              No selection
            </span>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-0.5">
          {nodes.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1 rounded text-xs transition-colors text-muted-foreground dark:text-muted-foreground hover:text-red-400 hover:bg-red-500/8"
            >
              Clear
            </button>
          )}

          {/* Manage Assets */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setShowAssets(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-sm text-xs font-semibold transition-all
                    bg-muted dark:bg-muted text-black dark:text-white
                    hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-black!"
                  >
                    <Grid2x2Plus className="w-3 h-3" />
                  </button>
                }
              />
              <TooltipContent>Manage Assets</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Manage Assets */}
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-sm text-xs font-semibold transition-all
                    bg-muted dark:bg-muted text-black dark:text-white
                    hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-black!"
                  >
                    <Grid2x2Plus className="w-3 h-3" />
                  </button>
                }
              />
              <TooltipContent>Manage Assets</TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          {/* Export */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setShowExport(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-sm text-xs font-semibold transition-all
                  bg-muted dark:bg-muted text-black dark:text-white
                  hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-black!"
                  >
                    <Code2 className="w-3 h-3" />
                  </button>
                }
              />
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
}
