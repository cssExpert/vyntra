"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { FieldLabel, inputClass, SegmentedControl } from "./fields";
import { PRESET_COVERS } from "./types";
import { storageService } from "@/lib/storage";
import { mediaAssets, type MediaAsset } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { MotionTabs } from "@/components/ui/MotionTabs";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";

// ─── Subtype badge ────────────────────────────────────────────────────────────

const SUBTYPE_STYLES: Record<string, string> = {
  blogs: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  pages: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  general: "bg-muted text-muted-foreground border-border",
  branding: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  profiles: "bg-green-500/10 text-green-600 border-green-500/20",
};

function SubtypeBadge({ subtype }: { subtype: string | null }) {
  if (!subtype) return null;
  const style =
    SUBTYPE_STYLES[subtype] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style}`}
    >
      {subtype}
    </span>
  );
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Checks a MIME type against a comma-separated `accept` string (supports "image/*" wildcards). */
function matchesAccept(fileType: string, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").some((pattern) => {
    pattern = pattern.trim();
    if (pattern.endsWith("/*")) return fileType.startsWith(pattern.slice(0, -1));
    return pattern === fileType;
  });
}

// ─── Library modal ────────────────────────────────────────────────────────────

const FILTERS = ["all", "blogs", "pages", "general"] as const;
type FilterType = (typeof FILTERS)[number];

export interface LibraryModalProps {
  currentValue: string;
  uploadCompanyId: string;
  currentSubtype: string;
  /** Storage module — e.g. "cms" (default) or "store" */
  module?: string;
  /** Filter tabs shown in the header. Defaults to CMS tabs. */
  filterOptions?: readonly string[];
  /** Comma-separated MIME types (e.g. "image/png,image/svg+xml"). Restricts both
   *  the "Upload new" file picker and which existing library assets are selectable. */
  accept?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  onToast?: (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  /** Tailwind z-index class passed through to the underlying Modal — raise this when opening from inside another overlay (e.g. a slide-over panel). */
  modalZIndexClassName?: string;
}

export function LibraryModal({
  currentValue,
  uploadCompanyId,
  currentSubtype,
  module: assetModule = "cms",
  filterOptions,
  accept,
  onSelect,
  onClose,
  onToast,
  modalZIndexClassName,
}: LibraryModalProps) {
  const activeFilters = filterOptions ?? FILTERS;
  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a page of assets
  const load = useCallback(
    async (pageNum: number, sub: string, replace: boolean) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await mediaAssets.list({
          module: assetModule,
          subtype: sub === "all" ? undefined : sub,
          page: pageNum,
          limit: 20,
        });
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setHasMore(res.hasMore);
        setPage(pageNum);
      } catch {
        onToast?.("Failed to load media library", "error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [assetModule, onToast],
  );

  // Reload when filter changes
  useEffect(() => {
    load(1, filter, true);
  }, [filter, load]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          load(page + 1, filter, false);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, filter, load]);

  // ESC to close + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Upload new file from within the modal
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!matchesAccept(file.type, accept)) {
      onToast?.("That file type isn't allowed here.", "error");
      return;
    }
    setIsUploading(true);
    onToast?.("Uploading…", "info");
    try {
      await storageService.upload({
        file,
        companyId: uploadCompanyId,
        module: assetModule,
        subtype: currentSubtype,
      });
      onToast?.("Uploaded!", "success");
      // Reload list from top so new file appears
      await load(1, filter, true);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      onToast?.(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (asset: MediaAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await mediaAssets.delete(asset.id);
      setItems((prev) => prev.filter((a) => a.id !== asset.id));
      setTotal((t) => t - 1);
      onToast?.("Deleted from library", "info");
    } catch {
      onToast?.("Delete failed", "error");
    }
  };

  // Restrict the grid to assets matching `accept`, even if the module/subtype
  // filter alone wouldn't exclude them.
  const visibleItems = accept
    ? items.filter((a) => matchesAccept(a.fileType, accept))
    : items;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Media Library"
      description={
        loading
          ? "Loading…"
          : `${total} asset${total !== 1 ? "s" : ""} · ${assetModule} module`
      }
      icon={<ImageIcon size={18} />}
      zIndexClassName={modalZIndexClassName}
      maxWidth="xxl"
      bodyMaxHeight="none"
      headerActions={
        <>
          {/* Subtype filter tabs */}
          <div className="hidden md:block">
            <MotionTabs<string>
              tabs={activeFilters.map((f) => ({
                id: f,
                label:
                  f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1),
              }))}
              active={filter}
              onChange={setFilter}
              layoutId="media-library-filter"
              size="sm"
            />
          </div>

          <div className="hidden md:flex items-center">
            {/* Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept ?? "image/*"}
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              type="button"
              radius="lg"
              onClick={() => fileInputRef.current?.click()}
              loading={isUploading}
              className="gap-1.5 px-3 font-bold h-[34px] max-h-[34px]"
              startIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload new
            </Button>
          </div>
        </>
      }
    >
      {/* Scrollable grid — own scroller so scrollRef + the infinite-scroll
          sentinel keep working inside the Modal body. Fixed height (not max)
          so the modal doesn't resize/re-center when tab content changes. */}
      <div
        ref={scrollRef}
        className="overflow-y-auto p-5"
        style={{ height: "62vh" }}
      >
        {loading ? (
          // Skeleton
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No media yet
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {filter !== "all"
                  ? `No "${filter}" images in the library yet.`
                  : "Upload your first image to get started."}
              </p>
            </div>
            <Button
              type="button"
              radius="lg"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 px-4 font-bold"
              startIcon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Upload image
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-3">
              {visibleItems.map((asset) => {
                const selected = currentValue === asset.url;
                return (
                  <div
                    key={asset.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(asset.url)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        onSelect(asset.url);
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selected
                        ? "border-primary shadow-lg shadow-primary/20 scale-[0.97]"
                        : "border-primary-500/10 hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.fileName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = "none";
                        }}
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-2 space-y-1">
                        <span className="w-fit px-1 py-0.5 rounded-[3px] inline-flex text-[8px] bg-white/20 text-white">
                          {formatBytes(asset.size)}
                        </span>
                        <p className="text-xs text-white font-medium truncate leading-tight font-mono">
                          {asset.fileName}
                        </p>
                      </div>

                      {/* Delete btn — standalone button, not nested inside another button */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(asset, e)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-700 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="Remove from library"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>

                      {/* Selected checkmark */}
                      {selected && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Caption row */}
                    <div className="px-2 py-1.5 bg-card flex flex-col items-start gap-1 border-t border-border/50">
                      <SubtypeBadge subtype={asset.subtype} />
                      <p className="text-xs text-muted-foreground w-full truncate leading-tight font-mono">
                        {asset.fileName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4 mt-2" />

            {loadingMore && (
              <div className="flex items-center justify-center py-4 gap-2 text-[11px] text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading more…
              </div>
            )}

            {!hasMore && items.length > 0 && (
              <p className="text-center text-xs md:text-sm text-muted-foreground py-4">
                All {total} asset{total !== 1 ? "s" : ""} loaded
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Main CoverImagePicker ────────────────────────────────────────────────────

type CoverTab = "presets" | "ai" | "upload";

export interface CoverImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  subtype?: string;
  onToast?: (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
}

export function CoverImagePicker({
  value,
  onChange,
  subtype = "general",
  onToast,
}: CoverImagePickerProps) {
  const [tab, setTab] = useState<CoverTab>("presets");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";

  useEffect(() => setMounted(true), []);

  const doUpload = async (file: File) => {
    setIsUploading(true);
    onToast?.("Uploading cover image…", "info");
    try {
      const result = await storageService.upload({
        file,
        companyId: uploadCompanyId,
        module: "cms",
        subtype,
      });
      onChange(result.url);
      onToast?.("Cover image uploaded!", "success");
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

  const generateAI = () => {
    if (!aiPrompt.trim()) {
      onToast?.("Please enter an AI prompt first!", "warning");
      return;
    }
    setIsGenerating(true);
    onToast?.("Generating custom banner…", "info");
    setTimeout(() => {
      onChange(PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)]);
      setIsGenerating(false);
      onToast?.("AI banner injected!", "success");
    }, 1600);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <FieldLabel>Primary Cover Image</FieldLabel>
        <div className="flex items-center gap-2">
          <SegmentedControl<CoverTab>
            value={tab}
            onChange={setTab}
            options={[
              { id: "presets", label: "Presets" },
              { id: "ai", label: "✨ AI" },
              { id: "upload", label: "Upload" },
            ]}
          />
          <Button
            size="sm"
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <ImageIcon className="w-3 h-3" />
            Library
          </Button>
        </div>
      </div>

      {/* ── Presets ── */}
      {tab === "presets" && (
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COVERS.map((cov, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(cov)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                value === cov
                  ? "border-primary scale-95 shadow-md"
                  : "border-transparent hover:border-muted-foreground/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cov} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── AI ── */}
      {tab === "ai" && (
        <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Prompt the AI to generate a custom cover banner.
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Minimalist technical workspace, neon vector…"
              className={inputClass}
            />
            <button
              type="button"
              onClick={generateAI}
              disabled={isGenerating}
              className="px-3 py-2 bg-primary hover:bg-primary-600 disabled:opacity-60 text-primary-foreground font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Generate
            </button>
          </div>
        </div>
      )}

      {/* ── Upload ── */}
      {tab === "upload" && (
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <UploadCloud className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          {isUploading ? (
            <p className="text-xs font-semibold text-muted-foreground animate-pulse">
              Uploading…
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                Drag & drop an image, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG, WEBP · Stored via configured provider
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Current cover preview ── */}
      {value && (
        <div className="relative mt-3 aspect-[21/9] rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute bottom-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg shadow-sm hover:bg-rose-700 transition-colors"
            title="Remove cover"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Library modal (portal) ── */}
      {mounted &&
        libraryOpen &&
        createPortal(
          <LibraryModal
            currentValue={value}
            uploadCompanyId={uploadCompanyId}
            currentSubtype={subtype}
            onSelect={(url) => {
              onChange(url);
              setLibraryOpen(false);
            }}
            onClose={() => setLibraryOpen(false)}
            onToast={onToast}
          />,
          document.body,
        )}
    </div>
  );
}
