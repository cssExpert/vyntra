"use client";

import { useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlignStartVertical,
  AlignHorizontalSpaceAround,
  AlignEndVertical,
  Download,
  RefreshCw,
  Trash2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Icon from "@/components/common/Icon";
import { storageService } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";

type Align = "left" | "center" | "right" | "full";

const ALIGN_OPTS: {
  value: Align;
  icon: typeof AlignStartVertical;
  label: string;
}[] = [
  { value: "left", icon: AlignStartVertical, label: "Align left" },
  { value: "center", icon: AlignHorizontalSpaceAround, label: "Align center" },
  { value: "right", icon: AlignEndVertical, label: "Align right" },
];

function downloadImage(src: string, name = "image") {
  const a = document.createElement("a");
  a.href = src;
  a.download = name;
  a.click();
}

export function ImageNodeView({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.blog-editor");
  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";
  const { src, alt, title, align, width, caption } = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    align: Align;
    width: string | null;
    caption: string | null;
  };

  const hasCaption = caption !== null;
  // Show the caption area if: image is selected and caption is toggled on,
  // OR image is deselected but caption has actual text (render as static figcaption).
  const showCaptionArea = (selected && hasCaption) || (!selected && !!caption);

  const imgRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startWRef = useRef(0);

  /* ── Resize drag ────────────────────────────────────────── */
  const onDrag = useCallback(
    (e: React.MouseEvent, dir: 1 | -1) => {
      e.preventDefault();
      e.stopPropagation();
      startXRef.current = e.clientX;
      startWRef.current = imgRef.current?.offsetWidth ?? 400;

      const onMove = (ev: MouseEvent) => {
        const delta = (ev.clientX - startXRef.current) * dir;
        updateAttributes({
          width: `${Math.max(80, Math.round(startWRef.current + delta))}px`,
        });
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updateAttributes],
  );

  /* ── Replace ────────────────────────────────────────────── */
  const onReplace = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const result = await storageService.upload({
          file,
          companyId: uploadCompanyId,
          module: "cms",
        });
        updateAttributes({ src: result.url });
      } catch {
        // Upload failed — leave the existing image in place.
      }
    };
    input.click();
  }, [updateAttributes, uploadCompanyId]);

  /* ── Toggle caption ─────────────────────────────────────── */
  const toggleCaption = useCallback(() => {
    updateAttributes({ caption: hasCaption ? null : "" });
  }, [hasCaption, updateAttributes]);

  /* ── Layout ─────────────────────────────────────────────── */
  const wrapperClass = cn(
    "my-3 flex w-full",
    align === "left" && "justify-start",
    align === "center" && "justify-center",
    align === "right" && "justify-end",
  );

  const imgStyle: React.CSSProperties =
    align === "full"
      ? { width: "100%", maxWidth: "100%", display: "block" }
      : { width: width ?? "auto", maxWidth: "100%", display: "block" };

  return (
    <NodeViewWrapper>
      <div className={wrapperClass}>
        <div
          className={cn(
            "relative inline-block transition-all duration-150",
            align === "full" && "w-full",
            selected
              ? "outline outline-2 outline-offset-0 outline-primary rounded-xl"
              : "outline outline-2 outline-transparent rounded-xl",
          )}
        >
          {/* ── Floating toolbar ──────────────────────────── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 440, damping: 30 }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute -top-12 left-0 right-0 mx-auto w-fit z-30 flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-neutral-900 shadow-[0_8px_32px_rgba(0,0,0,0.36)] whitespace-nowrap"
              >
                {/* Alignment */}
                {ALIGN_OPTS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    title={label}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateAttributes({
                        align: value,
                        ...(value === "full" ? { width: null } : {}),
                      });
                    }}
                    className={cn(
                      "p-1.5 rounded-sm transition-colors",
                      align === value
                        ? "bg-white/20 text-white"
                        : "text-white/50 hover:bg-white/12 hover:text-white",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}

                <span className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Caption toggle */}
                <button
                  type="button"
                  title="Caption"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCaption();
                  }}
                  className={cn(
                    "p-1.5 rounded-sm transition-colors",
                    hasCaption
                      ? "bg-white/20 text-white"
                      : "text-white/50 hover:bg-white/12 hover:text-white",
                  )}
                >
                  <Icon name="CaptionsIcon" size="14" className="w-3.5 h-3.5" />
                </button>

                <span className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Download */}
                <button
                  type="button"
                  title="Download"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    downloadImage(src, alt ?? "image");
                  }}
                  className="p-1.5 rounded-sm text-white/50 hover:bg-white/12 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Replace */}
                <button
                  type="button"
                  title="Replace image"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onReplace();
                  }}
                  className="p-1.5 rounded-sm text-white/50 hover:bg-white/12 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <span className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Delete */}
                <button
                  type="button"
                  title="Delete image"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteNode();
                  }}
                  className="p-1.5 rounded-sm text-white/50 hover:bg-red-400/80 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Image + handles (own relative container) ──── */}
          <div className="relative">
            <img
              ref={imgRef}
              src={src}
              alt={alt ?? ""}
              title={title}
              style={imgStyle}
              className={cn(
                "select-none block",
                showCaptionArea ? "rounded-t-xl" : "rounded-xl",
              )}
              draggable={false}
            />

            {/* Left resize handle — flex centering avoids transform conflicts */}
            <AnimatePresence>
              {selected && align !== "full" && (
                <div className="absolute left-2 inset-y-0 flex items-center pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0.6 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0.6 }}
                    transition={{ duration: 0.15 }}
                    onMouseDown={(e) => onDrag(e, -1)}
                    className="w-1.5 h-10 rounded-full bg-primary cursor-ew-resize shadow-md hover:bg-primary/80 transition-colors pointer-events-auto"
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Right resize handle */}
            <AnimatePresence>
              {selected && align !== "full" && (
                <div className="absolute right-2 inset-y-0 flex items-center pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0.6 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0.6 }}
                    transition={{ duration: 0.15 }}
                    onMouseDown={(e) => onDrag(e, 1)}
                    className="w-1.5 h-10 rounded-full bg-primary cursor-ew-resize shadow-md hover:bg-primary/80 transition-colors pointer-events-auto"
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Sparkle button — bottom-3 is now relative to image only */}
            <AnimatePresence>
              {selected && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: 0.05,
                  }}
                  type="button"
                  title="AI enhance (coming soon)"
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:bg-neutral-900 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Caption bar ───────────────────────────────── */}
          <AnimatePresence>
            {showCaptionArea && (
              <motion.div
                key="caption"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden rounded-b-xl border-t border-border/30 bg-muted/60 backdrop-blur-sm"
              >
                {selected ? (
                  <input
                    type="text"
                    value={caption ?? ""}
                    placeholder="Add a caption…"
                    onChange={(e) =>
                      updateAttributes({ caption: e.target.value })
                    }
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full bg-transparent px-4 py-2.5 text-center text-sm text-muted-foreground placeholder:text-muted-foreground/40 outline-none"
                  />
                ) : (
                  <p className="px-4 py-2.5 text-center text-sm text-muted-foreground">
                    {caption}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
