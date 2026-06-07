"use client";

import { useRef, useState, useCallback } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { motion } from "framer-motion";
import { FileImage, ArrowUpFromLine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { storageService } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageUploaderView({
  editor,
  node,
  getPos,
  deleteNode,
}: NodeViewProps) {
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;

      setError("");
      setFileName(file.name);
      setFileSize(formatBytes(file.size));
      setProgress(0);
      setStatus("uploading");

      try {
        // Upload through the configured storage provider (local/S3/Uploadthing).
        const result = await storageService.upload({
          file,
          companyId: uploadCompanyId,
          module: "cms",
          onProgress: (p) => setProgress(p),
        });

        const pos = typeof getPos === "function" ? getPos() : 0;
        editor
          .chain()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .insertContentAt(pos, {
            type: "image",
            attrs: {
              src: result.url,
              align: "center",
              width: null,
            },
          })
          .run();
      } catch (e) {
        // Keep the node in place so the user can retry; surface the error.
        setStatus("idle");
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    },
    [editor, getPos, node.nodeSize, uploadCompanyId],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <NodeViewWrapper>
      <div className="my-3 select-none" contentEditable={false}>
        {status === "idle" ? (
          /* ── Drop zone ──────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-4 py-12 rounded-xl",
              "border-2 border-dashed cursor-pointer transition-all duration-200",
              /* solid card bg — white in light, #141414 in dark */
              "bg-card",
              isDragOver
                ? "border-primary bg-primary/5 scale-[1.005]"
                : "border-border hover:border-primary hover:bg-muted/40",
            )}
          >
            {/* Icon stack */}
            <div className="relative">
              {/* File icon box — solid muted bg, visible in both themes */}
              <div className="w-14 h-16 rounded-xl bg-muted flex items-center justify-center">
                <FileImage className="w-7 h-7 text-muted-foreground" />
              </div>
              {/* Upload badge */}
              <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <ArrowUpFromLine className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-foreground">
                <span className="underline underline-offset-2 font-medium cursor-pointer">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                Maximum 1 file, 5MB.
              </p>
              {error && (
                <p className="text-xs font-medium text-error">{error}</p>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
              }}
            />
          </motion.div>
        ) : (
          /* ── Upload progress ────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            /* solid card bg + border so it's equally visible in light and dark */
            className="relative h-[60px] rounded-xl overflow-hidden border border-border bg-card"
          >
            {/* Progress fill — primary colour slides in from the left */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.12 }}
            />

            {/* Row content — sits above the fill */}
            <div className="relative z-10 flex items-center h-full px-4 gap-3">
              {/* Icon — always on a solid primary circle so it stays readable */}
              <div className="w-8 h-8 rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20 flex items-center justify-center shrink-0">
                <ArrowUpFromLine className="w-4 h-4 text-primary-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                {/* Use primary-foreground so text is legible on the moving fill
                    AND on the card bg: primary-foreground is white, which reads
                    well on primary-blue fill; on the card bg side it looks like
                    a coloured label — acceptable trade-off kept intentional. */}
                <p className="text-sm font-semibold truncate leading-tight text-foreground">
                  {fileName}
                </p>
                <p className="text-xs leading-tight text-muted-foreground">
                  {fileSize}
                </p>
              </div>

              <span className="text-sm font-bold text-primary-foreground shrink-0 tabular-nums w-10 text-right">
                {progress}%
              </span>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteNode();
                }}
                className="w-6 h-6 flex items-center justify-center rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
