"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Check, Image as ImageIcon, Calendar, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadGalleries, updateGalleryCover } from "./gallery.store";
import { getGalleryItems, type GalleryItem } from "./gallery.items.data";
import type { Gallery } from "./gallery.types";

interface Toast {
  id: number;
  message: string;
}

export function GalleryDetailView({ galleryId }: { galleryId: string }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const found = loadGalleries().find((g) => g.id === galleryId) ?? null;
    setGallery(found);
    setItems(getGalleryItems(galleryId));
  }, [galleryId]);

  const showToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const handleSetCover = (item: GalleryItem) => {
    if (!gallery) return;
    updateGalleryCover(gallery.id, item.url);
    setGallery((prev) => prev ? { ...prev, coverUrl: item.url } : prev);
    showToast(`"${item.label}" set as cover photo`);
  };

  if (!gallery) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">Gallery not found</p>
        <button onClick={() => router.push("/cms/gallery")} className="text-sm text-primary hover:text-primary/80 underline">
          Back to galleries
        </button>
      </div>
    );
  }

  return (
    <div className="font-sans text-foreground pb-16">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 100 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p>{t.message}</p>
              </div>
              <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-foreground transition-colors ml-4">
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Back + header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/cms/gallery")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Galleries
        </button>

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Current cover preview */}
          <div className="w-full md:w-64 shrink-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Cover</p>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-muted">
              <img
                src={gallery.coverUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Gallery info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                gallery.status === "published"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20",
              )}>
                {gallery.status}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-muted text-muted-foreground border-border uppercase tracking-wider">
                {gallery.category}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-2">
              {gallery.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
              {gallery.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5"><ImageIcon size={13} />{items.length} items</span>
              <span className="flex items-center gap-1.5"><Eye size={13} />{gallery.views.toLocaleString()} views</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} />{gallery.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div>
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Gallery Items</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hover an image and click <span className="font-semibold text-primary">Set as Cover</span> to update the gallery thumbnail
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-bold border border-border">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No items yet</p>
            <p className="text-sm text-muted-foreground mt-1">Upload images to populate this gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => {
              const isCover = item.url === gallery.coverUrl;
              return (
                <motion.div
                  key={item.id}
                  layout
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Current cover badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                      <Star size={10} className="fill-current" />
                      Cover
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {isCover ? (
                      <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                        <Check size={13} /> Current Cover
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSetCover(item)}
                        className="flex items-center gap-1.5 bg-white hover:bg-primary hover:text-white text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transition-colors"
                      >
                        <Star size={13} /> Set as Cover
                      </button>
                    )}
                    <p className="text-white text-[11px] font-medium">{item.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
