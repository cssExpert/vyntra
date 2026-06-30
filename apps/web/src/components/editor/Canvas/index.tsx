"use client";

import { useRef, useState, useEffect, Fragment, lazy, Suspense } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Tablet,
  Smartphone,
  MousePointer2,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  Check,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Save,
  Globe,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Grid3X3,
  BoxSelect,
  Keyboard,
  Settings2,
  LayoutTemplate,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { ResponsiveMode } from "@/types/editor";
import CanvasNode from "./CanvasNode";
import { cn } from "@/lib/utils";
import AddressBar from "./AddressBar";
import { useEditorSave } from "../EditorSaveContext";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import { KeyboardShortcutsModal } from "../modals/KeyboardShortcutsModal";
import { PageSettingsPanel } from "../PageSettingsPanel";

const PreviewPane = lazy(() => import("./PreviewPane"));

// ── Device presets ─────────────────────────────────────────────────────────────

interface DevicePreset {
  name: string;
  width: number | null;
}

const DEVICE_PRESETS: Record<ResponsiveMode, DevicePreset[]> = {
  desktop: [
    { name: "Full Width", width: null },
    { name: "Desktop XL", width: 1440 },
    { name: "Desktop", width: 1280 },
    { name: "Laptop", width: 1024 },
  ],
  tablet: [
    { name: 'iPad Pro 12.9"', width: 1024 },
    { name: 'iPad Air / Pro 11"', width: 820 },
    { name: "iPad / iPad Mini", width: 768 },
  ],
  mobile: [
    { name: "Pixel 7 / Android", width: 412 },
    { name: "iPhone 14 Pro", width: 393 },
    { name: "iPhone SE", width: 375 },
    { name: "Galaxy S21", width: 360 },
  ],
};

const DEFAULT_WIDTHS: Record<ResponsiveMode, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 393,
};

// ── Zoom helpers ───────────────────────────────────────────────────────────────

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

function nextZoomIn(current: number): number {
  return ZOOM_STEPS.find((z) => z > current + 0.005) ?? 2;
}
function nextZoomOut(current: number): number {
  return [...ZOOM_STEPS].reverse().find((z) => z < current - 0.005) ?? 0.25;
}
function fmtZoom(z: number): string {
  return `${Math.round(z * 100)}%`;
}

// ── Insert zone (DnD) ─────────────────────────────────────────────────────────

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
        isOver ? "border-primary bg-primary/10" : "border-border",
      )}
    >
      <span
        className={cn(
          "text-xs font-medium pointer-events-none transition-colors duration-150",
          isOver ? "text-primary" : "text-muted-foreground",
        )}
      >
        Drop here
      </span>
    </div>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export default function Canvas() {
  const {
    nodes,
    responsiveMode,
    canvasWidth,
    canvasZoom,
    setCanvasZoom,
    selectNode,
    showGrid,
    previewMode,
    setPreviewMode,
    canvasPreviewDark,
    undo,
    redo,
    canUndo,
    canRedo,
    setShowTemplatePicker,
  } = useEditorStore();

  const { onSaveDraft, draftState, publishState } = useEditorSave();

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { active } = useDndContext();
  const isDragActive = active?.data.current?.type === "BLOCK";

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: { type: "CANVAS_ROOT" },
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Escape exits preview mode
      if (e.key === "Escape" && previewMode) {
        setPreviewMode(false);
        return;
      }

      if (!e.ctrlKey && !e.metaKey) return;
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable;

      // Ctrl+S — save draft
      if (e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        if (draftState === "idle" || draftState === "error") onSaveDraft();
        return;
      }

      // Undo / redo
      if (e.key === "z" && !e.shiftKey) {
        if (isEditable) return;
        e.preventDefault();
        if (canUndo) undo();
        return;
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        if (isEditable) return;
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Zoom — skip when in inputs
      if (isEditable) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setCanvasZoom(nextZoomIn(canvasZoom));
      } else if (e.key === "-") {
        e.preventDefault();
        setCanvasZoom(nextZoomOut(canvasZoom));
      } else if (e.key === "0") {
        e.preventDefault();
        setCanvasZoom(1);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    canvasZoom, setCanvasZoom,
    undo, redo, canUndo, canRedo,
    onSaveDraft, draftState, publishState,
    previewMode, setPreviewMode,
  ]);

  const hasWidthConstraint = canvasWidth !== null;

  const activePreset = DEVICE_PRESETS[responsiveMode].find(
    (p) => p.width === canvasWidth,
  );
  const widthLabel = activePreset
    ? activePreset.width !== null
      ? `${activePreset.name} · ${activePreset.width}px`
      : "Full Width"
    : canvasWidth !== null
      ? `${canvasWidth}px`
      : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* ── PREVIEW MODE ─────────────────────────────────────────── */}
      {previewMode ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slim preview toolbar */}
          <div className="shrink-0 z-50 bg-muted border-b border-border px-5 py-2">
            <PreviewToolbar />
          </div>
          {/* Full-bleed preview */}
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            }
          >
            <PreviewPane />
          </Suspense>
        </div>
      ) : (
        /* ── EDIT MODE ──────────────────────────────────────────── */
        <>
          <div className="flex-1 flex overflow-hidden px-5 py-5">
            <div
              className={cn(
                "relative flex flex-col transition-all mx-auto duration-300 w-full rounded-xl overflow-hidden",
                hasWidthConstraint || responsiveMode !== "desktop" ? "shadow-2xl" : "",
              )}
              style={hasWidthConstraint ? { maxWidth: canvasWidth! } : undefined}
            >
              <div
                ref={(el) => {
                  setNodeRef(el);
                  canvasRef.current = el;
                }}
                className={cn(
                  "flex-1 flex flex-col bg-card rounded-xl overflow-hidden relative border border-border",
                  showGrid && "bg-grid-pattern",
                  isOver && nodes.length === 0 && "outline outline-primary -outline-offset-2",
                )}
                onClick={(e) => {
                  if (e.target === canvasRef.current) selectNode(null);
                }}
              >
                {/* Toolbar */}
                <div className="z-50 shrink-0 bg-muted border-b border-border px-3 py-2">
                  <CanvasToolbar />
                </div>

                {/* Canvas scroll area */}
                <div
                  data-canvas-scroll
                  className={cn(
                    "flex-1 overflow-auto relative @container transition-colors duration-300",
                    canvasPreviewDark ? "canvas-preview-dark dark" : "canvas-preview-light",
                  )}
                >
                  {widthLabel && (
                    <div className="sticky top-0 left-0 right-0 flex justify-center pointer-events-none z-10">
                      <div className="text-[10px] px-3 py-0.5 rounded-b-md font-mono bg-primary/90 text-white tracking-wide">
                        {widthLabel}
                      </div>
                    </div>
                  )}

                  <div style={{ zoom: canvasZoom, minHeight: "100%" }}>
                    <AnimatePresence>
                      {nodes.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center text-center pointer-events-none min-h-[60vh]"
                        >
                          <div
                            className={cn(
                              "group w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-colors",
                              isOver ? "bg-primary/10" : "bg-muted",
                            )}
                          >
                            {isOver ? (
                              <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 w-8 h-8 text-primary" />
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
                          {!isOver && (
                            <button
                              onClick={() => setShowTemplatePicker(true)}
                              className="mt-5 pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              <LayoutTemplate className="w-4 h-4" />
                              Use a template
                            </button>
                          )}
                        </motion.div>
                      ) : (
                        <div className={cn("pb-2 px-2 md:px-4", widthLabel ? "pt-2" : "pt-10")}>
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

          <ZoomHUD />
        </>
      )}
    </div>
  );
}

// ── Preview mode toolbar ───────────────────────────────────────────────────────

function PreviewToolbar() {
  const { setPreviewMode } = useEditorStore();
  const { pageSlug } = useEditorSave();
  const { previewUrl } = useSitePreviewUrl();
  const href = previewUrl(pageSlug ?? undefined) ?? undefined;

  return (
    <div className="flex items-center justify-between">
      {/* Exit button */}
      <button
        onClick={() => setPreviewMode(false)}
        className="flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold
          border border-border text-muted-foreground hover:text-foreground hover:bg-background
          transition-colors"
      >
        <EyeOff className="w-3.5 h-3.5" />
        Exit Preview
        <span className="hidden sm:inline ml-1 font-normal opacity-50">Esc</span>
      </button>

      {/* Center indicator */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-muted-foreground">Live Preview</span>
      </div>

      {/* Open in new tab */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!href}
        onClick={!href ? (e) => e.preventDefault() : undefined}
        className={cn(
          "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors",
          href
            ? "text-muted-foreground hover:text-foreground hover:bg-background border border-border"
            : "text-muted-foreground/30 cursor-not-allowed border border-transparent",
        )}
      >
        Open in tab
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// ── Floating zoom HUD ─────────────────────────────────────────────────────────

function ZoomHUD() {
  const { canvasZoom, setCanvasZoom } = useEditorStore();
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropOpen) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropOpen]);

  const canZoomIn = canvasZoom < 2 - 0.005;
  const canZoomOut = canvasZoom > 0.25 + 0.005;

  return (
    <div
      ref={ref}
      className="absolute bottom-4 right-5 z-50 flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-lg px-1 py-1"
    >
      <button
        onClick={() => setCanvasZoom(nextZoomOut(canvasZoom))}
        disabled={!canZoomOut}
        title="Zoom out (Ctrl+-)"
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
          canZoomOut
            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
            : "text-muted-foreground/30 cursor-not-allowed",
        )}
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setDropOpen((p) => !p)}
        onDoubleClick={() => { setCanvasZoom(1); setDropOpen(false); }}
        title="Click for zoom levels · Double-click to reset 100%"
        className={cn(
          "relative h-7 px-2 rounded-md font-mono text-xs font-semibold transition-colors min-w-[46px] text-center",
          dropOpen ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
        )}
      >
        {fmtZoom(canvasZoom)}

        {dropOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-full right-0 mb-1.5 w-36 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-[200]"
          >
            <div className="px-3 py-1.5 border-b border-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zoom</span>
            </div>
            <div className="py-1">
              {ZOOM_STEPS.map((z) => {
                const isActive = Math.abs(z - canvasZoom) < 0.005;
                return (
                  <button
                    key={z}
                    onClick={(e) => { e.stopPropagation(); setCanvasZoom(z); setDropOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Check className={cn("w-3 h-3 shrink-0", isActive ? "opacity-100" : "opacity-0")} />
                      <span className="font-mono font-medium">{fmtZoom(z)}</span>
                    </div>
                    {z === 1 && <span className="text-[9px] text-muted-foreground/60">default</span>}
                  </button>
                );
              })}
            </div>
            <div className="px-3 py-1.5 border-t border-border">
              <p className="text-[9px] text-muted-foreground/60">Ctrl+= · Ctrl+- · Ctrl+0</p>
            </div>
          </motion.div>
        )}
      </button>

      <button
        onClick={() => setCanvasZoom(nextZoomIn(canvasZoom))}
        disabled={!canZoomIn}
        title="Zoom in (Ctrl+=)"
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
          canZoomIn
            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
            : "text-muted-foreground/30 cursor-not-allowed",
        )}
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Canvas toolbar (edit mode) ────────────────────────────────────────────────

function CanvasToolbar() {
  const {
    responsiveMode,
    setResponsiveMode,
    canvasWidth,
    setCanvasWidth,
    nodes,
    canvasPreviewDark,
    setCanvasPreviewDark,
    undo,
    redo,
    canUndo,
    canRedo,
    previewMode,
    setPreviewMode,
    showGrid,
    setShowGrid,
    showOutlines,
    setShowOutlines,
    showTemplatePicker,
    setShowTemplatePicker,
  } = useEditorStore();

  const { publishState, draftState, isLandingPage, onPublish, onSaveDraft } =
    useEditorSave();

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Open shortcuts modal with ? key (no modifiers)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable
      ) return;
      e.preventDefault();
      setShortcutsOpen((p) => !p);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const modes: { id: ResponsiveMode; icon: React.ElementType; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  const presets = DEVICE_PRESETS[responsiveMode];
  const widthDisplay = canvasWidth !== null ? `${canvasWidth}px` : "Full";

  function handleModeClick(id: ResponsiveMode) {
    if (id === responsiveMode) {
      setPickerOpen((prev) => !prev);
    } else {
      setResponsiveMode(id);
      setCanvasWidth(DEFAULT_WIDTHS[id]);
      setPickerOpen(true);
    }
  }

  function handlePresetSelect(width: number | null) {
    setCanvasWidth(width);
    setPickerOpen(false);
  }

  return (
    <>
    <KeyboardShortcutsModal
      open={shortcutsOpen}
      onClose={() => setShortcutsOpen(false)}
    />
    <PageSettingsPanel
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
    />

    <div className="flex items-center justify-between px-2">
      {/* Left: traffic lights + element count + undo/redo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF4B58]" />
          <div className="w-3 h-3 rounded-full bg-[#FFC600]" />
          <div className="w-3 h-3 rounded-full bg-[#00CA48]" />
        </div>
        <span className="text-xs text-muted-foreground hidden @md:block">
          {nodes.length} element{nodes.length !== 1 ? "s" : ""}
        </span>

        <div className="w-px h-4 bg-border" />

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            canUndo
              ? "text-muted-foreground hover:text-foreground hover:bg-background"
              : "text-muted-foreground/30 cursor-not-allowed",
          )}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            canRedo
              ? "text-muted-foreground hover:text-foreground hover:bg-background"
              : "text-muted-foreground/30 cursor-not-allowed",
          )}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-border" />

        {/* Grid overlay toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          title={showGrid ? "Hide grid" : "Show grid"}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            showGrid
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          )}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>

        {/* Outline toggle */}
        <button
          onClick={() => setShowOutlines(!showOutlines)}
          title={showOutlines ? "Hide outlines" : "Show outlines"}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            showOutlines
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          )}
        >
          <BoxSelect className="w-3.5 h-3.5" />
        </button>
      </div>

      <AddressBar />

      {/* Right: save/publish + preview + dark toggle + device picker */}
      <div className="flex items-center gap-0.5">
        {/* Save Draft */}
        {!isLandingPage && (
          <button
            onClick={onSaveDraft}
            disabled={draftState === "saving" || publishState === "saving"}
            title="Save draft (Ctrl+S)"
            className={cn(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold transition-all border disabled:opacity-50",
              draftState === "saved"
                ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                : draftState === "error"
                  ? "border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-background bg-transparent",
            )}
          >
            {draftState === "saving" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span className="hidden @lg:inline">
              {draftState === "saving"
                ? "Saving…"
                : draftState === "saved"
                  ? "Saved ✓"
                  : draftState === "error"
                    ? "Error"
                    : "Save"}
            </span>
          </button>
        )}

        {/* Publish */}
        <button
          onClick={onPublish}
          disabled={publishState === "saving" || draftState === "saving"}
          title="Publish page"
          className={cn(
            "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50",
            publishState === "saved"
              ? "bg-emerald-600 text-white"
              : publishState === "error"
                ? "bg-rose-600 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground",
          )}
        >
          {publishState === "saving" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Globe className="w-3 h-3" />
          )}
          <span className="hidden @lg:inline">
            {publishState === "saving"
              ? "Publishing…"
              : publishState === "saved"
                ? "Published ✓"
                : publishState === "error"
                  ? "Error — retry"
                  : "Publish"}
          </span>
        </button>

        <div className="w-px h-4 mx-1 bg-border" />

        {/* Preview toggle */}
        <button
          onClick={() => setPreviewMode(!previewMode)}
          title="Preview page"
          className={cn(
            "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold transition-all border",
            previewMode
              ? "border-primary text-primary bg-primary/10"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-background bg-transparent",
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden @xl:inline">Preview</span>
        </button>

        <div className="w-px h-4 mx-1 bg-border" />

        {/* Dark / light preview toggle */}
        <button
          onClick={() => setCanvasPreviewDark(!canvasPreviewDark)}
          title={canvasPreviewDark ? "Switch to light preview" : "Switch to dark preview"}
          className={cn(
            "flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium transition-all border",
            canvasPreviewDark
              ? "bg-[#1a1a1a] border-[#383838] text-[#ededed] hover:bg-[#252525]"
              : "bg-white border-[#e5e7eb] text-[#374151] hover:bg-gray-50",
          )}
        >
          {canvasPreviewDark ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
          <span className="hidden @sm:inline">
            {canvasPreviewDark ? "Dark" : "Light"}
          </span>
        </button>

        <div className="w-px h-4 mx-1.5 bg-border" />

        {/* Device picker */}
        <div ref={pickerRef} className="relative flex items-center gap-0.5">
          {modes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleModeClick(id)}
              title={label}
              className={cn(
                "flex w-8 h-8 items-center justify-center rounded-md transition-all",
                responsiveMode === id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
            </button>
          ))}

          <button
            onClick={() => setPickerOpen((p) => !p)}
            className={cn(
              "flex items-center gap-0.5 h-6 px-1.5 rounded-md font-mono text-[10px] font-semibold transition-colors",
              pickerOpen
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
            title="Choose device preset"
          >
            {widthDisplay}
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-150",
                pickerOpen && "rotate-180",
              )}
            />
          </button>

          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full right-0 mt-1.5 z-[100] w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                {(() => {
                  const ModeIcon = modes.find((m) => m.id === responsiveMode)!.icon;
                  return <ModeIcon className="w-3.5 h-3.5 text-primary shrink-0" />;
                })()}
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {responsiveMode} presets
                </span>
              </div>

              <div className="py-1">
                {presets.map((preset) => {
                  const isActive = preset.width === canvasWidth;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset.width)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Check
                          className={cn(
                            "w-3 h-3 shrink-0 transition-opacity",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="truncate text-xs font-medium">{preset.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">
                        {preset.width !== null ? `${preset.width}px` : "∞"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Custom width</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={320}
                    max={2560}
                    defaultValue={canvasWidth ?? ""}
                    placeholder="e.g. 960"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseInt((e.target as HTMLInputElement).value);
                        if (!isNaN(val) && val >= 320 && val <= 2560) handlePresetSelect(val);
                      }
                    }}
                    className="flex-1 h-7 px-2 rounded-md border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">px</span>
                </div>
                <p className="text-[9px] text-muted-foreground/60 mt-1">Press Enter to apply · 320–2560</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="w-px h-4 mx-1 bg-border" />

        {/* Keyboard shortcuts help */}
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard shortcuts (?)"
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            shortcutsOpen
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          )}
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* Page settings */}
        <button
          onClick={() => setSettingsOpen((p) => !p)}
          title="Page settings"
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            settingsOpen
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 mx-1 bg-border" />

        {/* Template picker */}
        <button
          onClick={() => setShowTemplatePicker(true)}
          title="Choose a template"
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
            showTemplatePicker
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          )}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
    </>
  );
}
