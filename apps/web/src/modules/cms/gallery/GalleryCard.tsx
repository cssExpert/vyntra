"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Calendar, Eye, MoreVertical, Globe, Lock, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gallery, GalleryStatus } from "./gallery.types";

interface GalleryCardProps {
  gallery: Gallery;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onToggleStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (id: string, title: string) => void;
}

export function GalleryCard({
  gallery, activeDropdownId, setActiveDropdownId, onToggleStatus, onDelete,
}: GalleryCardProps) {
  return (
    <motion.div
      layout
      className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={gallery.coverUrl}
          alt={gallery.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
            {gallery.category}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border",
            gallery.status === "published"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/20"
              : "bg-amber-950/80 text-amber-300 border-amber-500/20",
          )}>
            {gallery.status === "published" ? <><Globe className="w-3 h-3" /> Published</> : <><Lock className="w-3 h-3" /> Draft</>}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-background/70 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-lg border border-border/60">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-foreground">{gallery.itemCount} items</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {gallery.title}
            </h3>
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdownId(activeDropdownId === gallery.id ? null : gallery.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdownId === gallery.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-glass-md p-1.5 z-20"
                    >
                      <button
                        onClick={() => onToggleStatus(gallery.id, gallery.status)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        {gallery.status === "published" ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        Mark as {gallery.status === "published" ? "Draft" : "Published"}
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={() => onDelete(gallery.id, gallery.title)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Gallery
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{gallery.description}</p>
        </div>

        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {gallery.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                <Tag className="w-2.5 h-2.5 text-primary" />
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{gallery.createdAt}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{gallery.views.toLocaleString()} Views</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
