"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { motion } from "framer-motion";
import { FileImage, CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageUploaderView({ editor, node, getPos, deleteNode }: NodeViewProps) {
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataUrlRef = useRef("");

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;

      setFileName(file.name);
      setFileSize(formatBytes(file.size));
      setProgress(0);
      setStatus("uploading");

      const reader = new FileReader();
      reader.onload = () => { dataUrlRef.current = reader.result as string; };
      reader.readAsDataURL(file);

      let p = 0;
      timerRef.current = setInterval(() => {
        p += Math.random() * 15 + 8;
        if (p >= 100) {
          p = 100;
          clearInterval(timerRef.current!);
          setTimeout(() => {
            const pos = typeof getPos === "function" ? getPos() : 0;
            editor
              .chain()
              .deleteRange({ from: pos, to: pos + node.nodeSize })
              .insertContentAt(pos, {
                type: "image",
                attrs: { src: dataUrlRef.current, align: "center", width: null },
              })
              .run();
          }, 280);
        }
        setProgress(Math.min(100, Math.round(p)));
      }, 110);
    },
    [editor, getPos, node.nodeSize],
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <NodeViewWrapper>
      <div className="my-3 select-none" contentEditable={false}>
        {status === "idle" ? (
          /* ── Drop zone (Image #2) ─────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-4 py-12 rounded-xl",
              "border-2 border-dashed cursor-pointer transition-all duration-200",
              isDragOver
                ? "border-primary bg-primary/8 scale-[1.005]"
                : "border-primary/50 bg-muted/20 hover:border-primary hover:bg-muted/30",
            )}
          >
            {/* Icon stack */}
            <div className="relative">
              <div className="w-14 h-16 rounded-xl bg-muted/60 flex items-center justify-center shadow-inner">
                <FileImage className="w-7 h-7 text-muted-foreground/70" />
              </div>
              <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <CloudUpload className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-foreground">
                <span className="underline underline-offset-2 font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                Maximum 1 file, 5MB.
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />
          </motion.div>
        ) : (
          /* ── Upload progress (Image #3) ───────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[60px] rounded-xl overflow-hidden border border-border bg-muted/20"
          >
            {/* Progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary/85"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.12 }}
            />

            {/* Row content */}
            <div className="relative z-10 flex items-center h-full px-4 gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
                <CloudUpload className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {fileName}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{fileSize}</p>
              </div>
              <span className="text-sm font-bold text-primary shrink-0 tabular-nums w-10 text-right">
                {progress}%
              </span>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode(); }}
                className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
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
