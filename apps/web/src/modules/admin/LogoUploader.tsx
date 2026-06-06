"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminInput } from "./AdminGuard";

interface LogoUploaderProps {
  value: string;           // current value — either a data-url or a https:// url
  onChange: (v: string) => void;
  error?: string;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif"];
const MAX_SIZE_MB = 2;

export function LogoUploader({ value, onChange, error }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setFileError(null);
    if (!ACCEPTED.includes(file.type)) {
      setFileError("Only PNG, JPG, SVG, WebP, or GIF files are accepted.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const clear = () => {
    onChange("");
    setFileError(null);
  };

  const displayError = fileError || error;
  const isPreviewable = value && (value.startsWith("data:") || value.startsWith("http"));

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 text-xs">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer",
            mode === "upload"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer",
            mode === "url"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          Enter URL
        </button>
      </div>

      {/* Upload drop zone */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : displayError
                ? "border-error bg-error/5"
                : "border-border bg-muted/20 hover:bg-muted/40",
          )}
        >
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            dragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}>
            <ImagePlus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {dragging ? "Drop it here" : "Click or drag to upload"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PNG, JPG, SVG, WebP — max {MAX_SIZE_MB} MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={onFileChange}
            className="sr-only"
          />
        </div>
      )}

      {/* URL input */}
      {mode === "url" && (
        <input
          type="url"
          className={cn(
            adminInput,
            displayError && "border-error focus:border-error focus:ring-error/20",
          )}
          value={value.startsWith("data:") ? "" : value}
          placeholder="https://cdn.acme.com/logo.png"
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Preview */}
      {isPreviewable && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Logo preview"
            className="h-12 w-12 rounded-lg object-contain border border-border bg-muted"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Preview</p>
            <p className="truncate text-xs text-muted-foreground">
              {value.startsWith("data:")
                ? `Uploaded image (${Math.round(value.length * 0.75 / 1024)} KB)`
                : value}
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-error/10 hover:text-error transition cursor-pointer"
            aria-label="Remove logo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {displayError && (
        <p className="flex items-center gap-1 text-xs text-error">
          <span className="inline-block h-3 w-3 shrink-0">⚠</span>
          {displayError}
        </p>
      )}
    </div>
  );
}
