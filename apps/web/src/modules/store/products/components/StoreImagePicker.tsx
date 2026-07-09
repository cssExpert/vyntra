"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileImage, ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { storageService } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { LibraryModal } from "@/modules/cms/blog-editor/CoverImagePicker";

export const STORE_FILTERS = ["all", "products", "categories"] as const;

interface StoreImagePickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Storage module — "store" (default), "branding", "cms", etc. */
  module?: string;
  /** Filter tabs in the library modal. Defaults to store tabs. */
  filterOptions?: readonly string[];
  /** Override company ID. Falls back to the authenticated user's org. */
  companyId?: string;
  subtype?: string;
  /** File accept string for the hidden input. */
  accept?: string;
  /** When true, hides the drag-and-drop upload zone — selection is limited to the media Library. */
  libraryOnly?: boolean;
  hint?: string;
  onToast?: (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  /** Tailwind z-index class for the library modal — raise this when opening from inside another overlay (e.g. a slide-over panel). */
  modalZIndexClassName?: string;
}

export function StoreImagePicker({
  value,
  onChange,
  module: assetModule = "store",
  filterOptions = STORE_FILTERS,
  companyId: companyIdProp,
  subtype = "products",
  accept = "image/png,image/jpeg,image/webp,image/gif",
  libraryOnly = false,
  hint,
  onToast,
  modalZIndexClassName,
}: StoreImagePickerProps) {
  const { user } = useAuth();
  const companyId = companyIdProp ?? user?.organizationId ?? "superadmin";

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const doUpload = async (file: File) => {
    setIsUploading(true);
    onToast?.("Uploading…", "info");
    try {
      const result = await storageService.upload({
        file,
        companyId,
        module: assetModule,
        subtype,
      });
      onChange(result.url);
      onToast?.("Image uploaded!", "success");
    } catch (err) {
      onToast?.(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await doUpload(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) await doUpload(file);
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input shared by upload zone + replace button */}
      {!libraryOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileInput}
        />
      )}

      {value ? (
        /* ── Image preview with hover controls ── */
        <div
          className={
            libraryOnly
              ? "group relative flex h-[184px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-border bg-slate-50/60 dark:bg-muted/20 p-4"
              : "relative aspect-video rounded-xl overflow-hidden border border-border group"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={
              libraryOnly
                ? "max-h-[150px] max-w-full object-contain"
                : "w-full h-full object-cover"
            }
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 rounded-[inherit]">
            <button
              type="button"
              onClick={() =>
                libraryOnly
                  ? setLibraryOpen(true)
                  : fileInputRef.current?.click()
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              {libraryOnly ? (
                <ImageIcon className="w-3.5 h-3.5" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              {libraryOnly ? "Change" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : libraryOnly ? (
        /* ── Library-only placeholder — no direct upload ── */
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="group relative flex h-[184px] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-border bg-slate-50/60 dark:bg-muted/20 px-8 py-6 cursor-pointer select-none transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.02]"
        >
          {/* Stacked icon badge */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-muted shadow-sm">
              <FileImage
                className="h-8 w-8 text-slate-400 dark:text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute -bottom-2.5 -right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
              <ImageIcon className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-1">
            <p className="text-sm text-foreground">
              <span className="font-bold underline underline-offset-2 decoration-foreground">
                Choose from Library
              </span>
            </p>
            {hint && (
              <p className="text-sm font-bold text-foreground/80">{hint}</p>
            )}
          </div>
        </button>
      ) : (
        /* ── Upload drop zone ── */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/50"
          }`}
        >
          <UploadCloud className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
          {isUploading ? (
            <p className="text-xs font-semibold text-muted-foreground animate-pulse">
              Uploading…
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                Drag & drop or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG, WebP
              </p>
            </>
          )}
        </div>
      )}

      {!libraryOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLibraryOpen(true)}
          className="w-full gap-1.5 font-semibold"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Browse Media Library
        </Button>
      )}

      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}

      {/* Library modal portal */}
      {mounted &&
        libraryOpen &&
        createPortal(
          <LibraryModal
            currentValue={value ?? ""}
            uploadCompanyId={companyId}
            currentSubtype={subtype}
            module={assetModule}
            filterOptions={filterOptions}
            accept={accept}
            onSelect={(url) => {
              onChange(url);
              setLibraryOpen(false);
            }}
            onClose={() => setLibraryOpen(false)}
            onToast={onToast}
            modalZIndexClassName={modalZIndexClassName}
          />,
          document.body,
        )}
    </div>
  );
}
