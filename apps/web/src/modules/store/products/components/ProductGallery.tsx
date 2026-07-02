"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Star, Trash2, ImageIcon, UploadCloud, Loader2, X, Check, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaAssets, storeProductMedia, type MediaAsset, type ApiProductMedia } from "@/lib/api";
import { storageService } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

// ─── GalleryLibraryModal (multi-select + multi-upload) ───────────────────────

function GalleryLibraryModal({
  onConfirm,
  onClose,
  companyId,
  excludeUrls,
}: {
  onConfirm: (urls: string[]) => void;
  onClose: () => void;
  companyId: string;
  excludeUrls: Set<string>;
}) {
  const [items,        setItems]        = useState<MediaAsset[]>([]);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [uploadCount,  setUploadCount]  = useState(0);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const scrollRef     = useRef<HTMLDivElement>(null);
  const sentinelRef   = useRef<HTMLDivElement>(null);

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await mediaAssets.list({ module: "store", page: pageNum, limit: 24 });
      setItems((prev) => replace ? res.items : [...prev, ...res.items]);
      setHasMore(res.hasMore);
      setPage(pageNum);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(1, true); }, [load]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        load(page + 1, false);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, load]);

  // ESC + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggleSelect = (url: string) => {
    if (excludeUrls.has(url)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  // Multi-file upload: process each file sequentially, auto-select uploaded urls
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadCount(files.length);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const result = await storageService.upload({
          file,
          companyId,
          module: "store",
          subtype: "products",
        });
        uploadedUrls.push(result.url);
      } catch {
        // continue uploading remaining files even if one fails
      }
    }

    setUploadCount(0);

    if (uploadedUrls.length > 0) {
      setSelected((prev) => new Set([...prev, ...uploadedUrls]));
      await load(1, true);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const imageItems = items.filter((a) => a.fileType.startsWith("image/"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border w-full flex flex-col"
        style={{ maxWidth: "900px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Media Library</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {uploadCount > 0
                ? `Uploading ${uploadCount} file${uploadCount !== 1 ? "s" : ""}…`
                : selected.size > 0
                ? `${selected.size} image${selected.size !== 1 ? "s" : ""} selected`
                : "Click images to select, then click Add"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadCount > 0}
              className="gap-1.5"
            >
              {uploadCount > 0
                ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                : <><UploadCloud size={13} /> Upload</>}
            </Button>
            {selected.size > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={() => onConfirm(Array.from(selected))}
                className="gap-1.5"
              >
                <Check size={13} />
                Add {selected.size} Image{selected.size !== 1 ? "s" : ""}
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div ref={scrollRef} className="overflow-y-auto p-5 flex-1">
          {loading ? (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : imageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No images yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Upload your first image to get started</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <UploadCloud size={13} /> Upload images
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                {imageItems.map((asset) => {
                  const isSelected  = selected.has(asset.url);
                  const alreadyUsed = excludeUrls.has(asset.url);
                  return (
                    <div
                      key={asset.id}
                      role="button"
                      tabIndex={alreadyUsed ? -1 : 0}
                      onClick={() => toggleSelect(asset.url)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggleSelect(asset.url);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        alreadyUsed
                          ? "opacity-40 cursor-not-allowed border-border"
                          : isSelected
                          ? "border-primary shadow-md shadow-primary/20 scale-[0.96]"
                          : "border-transparent hover:border-primary/40 hover:shadow-md"
                      }`}
                    >
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.fileName}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        {isSelected && (
                          <div className="absolute top-1 left-1 w-4.5 h-4.5 w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        {alreadyUsed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="text-[9px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-full">
                              Added
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="px-1.5 py-1 bg-card border-t border-border/50">
                        <p className="text-[9px] text-muted-foreground truncate font-mono leading-tight">
                          {asset.fileName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div ref={sentinelRef} className="h-4 mt-2" />

              {loadingMore && (
                <div className="flex items-center justify-center py-4 gap-2 text-[11px] text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading more…
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ProductGallery ───────────────────────────────────────────────────────────

interface ProductGalleryProps {
  productId?: string;
  initialMedia?: ApiProductMedia[];
  companyId?: string;
  onChange?: (items: GalleryItem[]) => void;
  /** Called whenever the primary image changes — url of the primary, or null if gallery is empty */
  onFeaturedChange?: (url: string | null) => void;
}

export function ProductGallery({
  productId,
  initialMedia = [],
  companyId: companyIdProp,
  onChange,
  onFeaturedChange,
}: ProductGalleryProps) {
  const { user } = useAuth();
  const companyId = companyIdProp ?? user?.organizationId ?? "superadmin";

  const [items,       setItems]       = useState<GalleryItem[]>(() =>
    initialMedia.map((m, i) => ({
      id:        m.id,
      url:       m.url,
      alt:       m.alt ?? undefined,
      isPrimary: m.isPrimary,
      sortOrder: i,
    })),
  );
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [busyIds,     setBusyIds]     = useState<Set<string>>(new Set());

  // DnD state
  const [draggedId,   setDraggedId]   = useState<string | null>(null);
  const [dragOverId,  setDragOverId]  = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!productId) onChange?.(items);
  }, [items, productId, onChange]);

  const existingUrls = new Set(items.map((i) => i.url));

  // ── Add images ─────────────────────────────────────────────────────────────

  const handleAddImages = async (urls: string[]) => {
    const fresh = urls.filter((u) => !existingUrls.has(u));
    if (fresh.length === 0) { setPickerOpen(false); return; }

    if (productId) {
      const added: GalleryItem[] = [];
      for (const url of fresh) {
        try {
          const isFirstEver = items.length === 0 && added.length === 0;
          const result = await storeProductMedia.add(productId, {
            url,
            type:      "image",
            isPrimary: isFirstEver,
            sortOrder: items.length + added.length,
          });
          added.push({
            id:        result.id,
            url:       result.url,
            alt:       result.alt ?? undefined,
            isPrimary: result.isPrimary,
            sortOrder: items.length + added.length,
          });
        } catch (err) {
          console.error("Failed to add media", err);
        }
      }
      setItems((prev) => {
        const next = [...prev, ...added];
        const primary = next.find((i) => i.isPrimary);
        onFeaturedChange?.(primary?.url ?? null);
        return next;
      });
    } else {
      const added: GalleryItem[] = fresh.map((url, i) => ({
        id:        `tmp_${Date.now()}_${i}`,
        url,
        alt:       undefined,
        isPrimary: items.length === 0 && i === 0,
        sortOrder: items.length + i,
      }));
      setItems((prev) => {
        const next = [...prev, ...added];
        const primary = next.find((i) => i.isPrimary);
        onFeaturedChange?.(primary?.url ?? null);
        return next;
      });
    }

    setPickerOpen(false);
  };

  // ── Remove ─────────────────────────────────────────────────────────────────

  const handleRemove = async (item: GalleryItem) => {
    if (busyIds.has(item.id)) return;
    setBusyIds((s) => new Set([...s, item.id]));

    if (productId) {
      try {
        await storeProductMedia.remove(productId, item.id);
      } catch {
        setBusyIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
        return;
      }
    }

    setItems((prev) => {
      const next = prev.filter((i) => i.id !== item.id);
      if (item.isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
        if (productId) {
          storeProductMedia.setPrimary(productId, next[0].id).catch(() => {});
        }
        onFeaturedChange?.(next[0].url);
      } else if (next.length === 0) {
        onFeaturedChange?.(null);
      }
      return next;
    });

    setBusyIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
  };

  // ── Set primary ────────────────────────────────────────────────────────────

  const handleSetPrimary = async (item: GalleryItem) => {
    if (item.isPrimary || busyIds.has(item.id)) return;
    setBusyIds((s) => new Set([...s, item.id]));

    if (productId) {
      try {
        await storeProductMedia.setPrimary(productId, item.id);
      } catch {
        setBusyIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
        return;
      }
    }

    setItems((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === item.id })));
    onFeaturedChange?.(item.url);
    setBusyIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
  };

  // ── Drag-to-reorder ────────────────────────────────────────────────────────

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIdx = items.findIndex((i) => i.id === draggedId);
    const toIdx   = items.findIndex((i) => i.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const reordered = next.map((item, i) => ({ ...item, sortOrder: i }));

    setItems(reordered);
    setDraggedId(null);
    setDragOverId(null);

    if (productId) {
      storeProductMedia.reorder(productId, reordered.map((i) => i.id)).catch(() => {});
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <>
          <p className="text-[11px] text-muted-foreground">
            Drag to reorder · First image is shown first
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {items.map((item) => {
              const isDragging = draggedId === item.id;
              const isTarget   = dragOverId === item.id;
              return (
                <div
                  key={item.id}
                  draggable={!busyIds.has(item.id)}
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(item.id)}
                  className={`group relative rounded-lg overflow-hidden border bg-muted transition-all select-none ${
                    busyIds.has(item.id)
                      ? "opacity-50 pointer-events-none border-border"
                      : isDragging
                      ? "opacity-30 border-border"
                      : isTarget
                      ? "border-primary ring-2 ring-primary/30 scale-[1.03]"
                      : "border-border cursor-grab active:cursor-grabbing hover:border-primary/40"
                  }`}
                  style={{ aspectRatio: "1" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt || ""}
                    className="w-full h-full object-cover pointer-events-none"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />

                  {/* Drag handle hint */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded p-0.5">
                      <GripVertical size={10} className="text-white" />
                    </div>
                  </div>

                  {/* Primary badge */}
                  {item.isPrimary && (
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      <Star size={7} fill="currentColor" /> Primary
                    </div>
                  )}

                  {/* Hover controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-center gap-1 p-1.5 opacity-0 group-hover:opacity-100">
                    {!item.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSetPrimary(item); }}
                        title="Set as primary"
                        className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/90 text-gray-900 rounded text-[9px] font-semibold hover:bg-white transition-colors shadow-sm"
                      >
                        <Star size={8} /> Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                      title="Remove"
                      className="flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-600/90 text-white rounded text-[9px] font-semibold hover:bg-rose-600 transition-colors shadow-sm"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
          <ImageIcon className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground font-medium">No gallery images</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Add images from the media library below</p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPickerOpen(true)}
        className="w-full gap-1.5 font-semibold"
      >
        <Plus size={14} /> Add from Media Library
      </Button>

      {mounted && pickerOpen && createPortal(
        <GalleryLibraryModal
          onConfirm={handleAddImages}
          onClose={() => setPickerOpen(false)}
          companyId={companyId}
          excludeUrls={existingUrls}
        />,
        document.body,
      )}
    </div>
  );
}
