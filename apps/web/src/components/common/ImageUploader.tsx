"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, X, FileImage, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  /** MIME types to accept, e.g. "image/png,image/jpeg,image/svg+xml". Defaults to "image/*" */
  accept?: string;
  /** Max file size in MB. Defaults to 2 */
  maxSizeMB?: number;
  /** How to display the preview thumbnail */
  previewShape?: "rounded" | "circle" | "wide";
  /** Short label shown inside the drop zone */
  label?: string;
  /** Replaces the default "Maximum 1 file, X MB." hint */
  hint?: string;
  className?: string;
  disabled?: boolean;
}

function formatBytes(mb: number) {
  return mb >= 1 ? `${mb} MB` : `${mb * 1024} KB`;
}

function parseAccept(accept: string): string {
  return accept
    .split(",")
    .map((t) => t.trim().replace("image/", "").toUpperCase())
    .join(", ");
}

export function ImageUploader({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 2,
  previewShape = "rounded",
  label,
  hint,
  className,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultHint = hint ?? `Maximum 1 file, ${formatBytes(maxSizeMB)}.`;

  const validate = (file: File): string | null => {
    if (accept !== "image/*") {
      const allowed = accept.split(",").map((t) => t.trim());
      if (!allowed.includes(file.type))
        return `Unsupported format. Allowed: ${parseAccept(accept)}`;
    } else if (!file.type.startsWith("image/")) {
      return "Please upload an image file.";
    }
    if (file.size > maxSizeMB * 1024 * 1024)
      return `File too large. Maximum size is ${formatBytes(maxSizeMB)}.`;
    return null;
  };

  const processFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accept, maxSizeMB, onChange],
  );

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) processFile(files[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  // ── Preview state ──────────────────────────────────────────
  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div
          className={cn(
            "relative overflow-hidden border border-border bg-muted/30 flex items-center justify-center",
            previewShape === "circle" && "w-20 h-20 rounded-full",
            previewShape === "wide" && "w-full rounded-xl aspect-[3/1]",
            previewShape === "rounded" && "w-full rounded-xl max-h-28",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className={cn(
              "object-contain",
              previewShape === "circle" && "w-full h-full object-cover",
              previewShape !== "circle" && "max-h-28 max-w-full",
            )}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-[inherit]">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow hover:bg-white transition"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                onChange(null);
              }}
              disabled={disabled}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/90 text-white shadow hover:bg-rose-600 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInput}
        />
      </div>
    );
  }

  // ── Drop zone ──────────────────────────────────────────────
  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) =>
          e.key === "Enter" && !disabled && inputRef.current?.click()
        }
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12",
          "cursor-pointer select-none transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : error
              ? "border-error/50 bg-error/5 hover:border-error"
              : "border-slate-300 dark:border-border bg-slate-50/60 dark:bg-muted/20 hover:border-primary/50 hover:bg-primary/[0.02]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          loading && "pointer-events-none",
        )}
      >
        {/* Stacked icon badge */}
        <div className="relative">
          {/* Document icon tile */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-muted shadow-sm">
            {loading ? (
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
            ) : (
              <FileImage
                className="h-8 w-8 text-slate-400 dark:text-muted-foreground"
                strokeWidth={1.5}
              />
            )}
          </div>
          {/* Upload badge */}
          {!loading && (
            <div className="absolute -bottom-2.5 -right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
              <UploadCloud className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          {loading ? (
            <p className="text-sm font-semibold text-foreground">Uploading…</p>
          ) : isDragging ? (
            <p className="text-sm font-bold text-primary">Drop to upload</p>
          ) : (
            <p className="text-sm text-foreground">
              <span className="font-bold underline underline-offset-2 decoration-foreground">
                Click to upload
              </span>
              {" or drag and drop"}
            </p>
          )}
          {!loading && !isDragging && (
            <p className="text-sm font-bold text-foreground/80">
              {defaultHint}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInput}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-error">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
