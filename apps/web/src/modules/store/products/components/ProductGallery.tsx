"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Star, Trash2, ImageIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storeProductMedia, type ApiProductMedia } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { LibraryModal } from "@/modules/cms/blog-editor/CoverImagePicker";
import { STORE_FILTERS } from "./StoreImagePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
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

  // Notify the parent of the current primary image via an effect, not inside
  // a setItems updater — updaters must stay pure (no calling another
  // component's setState from within one, or React errors at "Cannot update
  // a component while rendering a different component").
  useEffect(() => {
    const primary = items.find((i) => i.isPrimary);
    onFeaturedChange?.(primary?.url ?? null);
  }, [items, onFeaturedChange]);

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
      setItems((prev) => [...prev, ...added]);
    } else {
      const added: GalleryItem[] = fresh.map((url, i) => ({
        id:        `tmp_${Date.now()}_${i}`,
        url,
        alt:       undefined,
        isPrimary: items.length === 0 && i === 0,
        sortOrder: items.length + i,
      }));
      setItems((prev) => [...prev, ...added]);
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
        <LibraryModal
          currentValue=""
          uploadCompanyId={companyId}
          currentSubtype="products"
          module="store"
          filterOptions={STORE_FILTERS}
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiSelect
          excludeUrls={existingUrls}
          onSelectMultiple={handleAddImages}
          onClose={() => setPickerOpen(false)}
        />,
        document.body,
      )}
    </div>
  );
}
