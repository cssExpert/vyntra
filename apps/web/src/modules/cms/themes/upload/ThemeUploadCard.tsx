"use client";

import { useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, FileArchive, CheckCircle2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeUploadCardProps {
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}

const MAX_SIZE_MB = 50;

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb < 0.01 ? "< 0.01 MB" : `${mb.toFixed(2)} MB`;
}

export function ThemeUploadCard({ file, onChange, error }: ThemeUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const validate = useCallback((f: File): string | null => {
    if (!f.name.endsWith(".zip")) return "Only .zip files are supported.";
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File exceeds ${MAX_SIZE_MB}MB limit.`;
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File | null) => {
      setLocalError(undefined);
      if (!f) { onChange(null); return; }
      const err = validate(f);
      if (err) { setLocalError(err); return; }
      onChange(f);
    },
    [onChange, validate],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const displayError = error || localError;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload theme ZIP file"
        onClick={() => !file && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !file) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all duration-200 outline-none",
          !file
            ? isDragging
              ? "border-primary bg-primary/5 cursor-copy"
              : "border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/50 cursor-pointer"
            : "border-emerald-500/50 bg-emerald-500/5 cursor-default",
          displayError && "border-rose-500/60 bg-rose-500/5",
        )}
      >
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className={cn("rounded-2xl p-4 border", isDragging ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground")}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {isDragging ? "Drop your .zip file here" : "Drag & drop your .zip file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">or click to browse</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                {["HTML", "CSS", "JS", "Images", "Fonts", "Assets", "Thumbnail"].map((label) => (
                  <span key={label} className="px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground border border-border rounded-full">
                    {label}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">Max size: {MAX_SIZE_MB} MB</p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 text-center w-full"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <FileArchive className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-sm font-semibold text-foreground truncate max-w-xs">{file.name}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {displayError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {displayError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
