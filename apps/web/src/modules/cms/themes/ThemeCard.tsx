"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  Calendar,
  Eye,
  MoreVertical,
  Globe,
  Lock,
  Tag,
  Trash2,
  ExternalLink,
  PencilLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gallery, GalleryStatus } from "../gallery/gallery.types";

interface ThemeCardProps {
  theme: Gallery;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onToggleStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (id: string, title: string) => void;
  onNavigate: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ThemeCard({
  theme,
  activeDropdownId,
  setActiveDropdownId,
  onToggleStatus,
  onDelete,
  onNavigate,
  onEdit,
}: ThemeCardProps) {
  return (
    <motion.div
      layout
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
    >
      {/* Clickable cover */}
      <button
        onClick={() => onNavigate(theme.id)}
        className="relative aspect-[16/10] overflow-hidden bg-muted w-full text-left cursor-pointer"
      >
        <img
          src={theme.coverUrl}
          alt={theme.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category + status badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
            {theme.category}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border",
              theme.status === "published"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/20"
                : "bg-amber-950/80 text-amber-300 border-amber-500/20",
            )}
          >
            {theme.status === "published" ? (
              <>
                <Globe className="w-3 h-3" /> Published
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Draft
              </>
            )}
          </span>
        </div>

        {/* Sections count */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-background/70 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-lg border border-border/60">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span className="text-foreground">{theme.itemCount} sections</span>
        </div>

        {/* Open in editor overlay hint */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1 bg-background/80 backdrop-blur-md text-[10px] font-semibold px-2 py-1 rounded-md border border-accent/30 text-accent">
            <ExternalLink className="w-3 h-3" /> Open in Editor
          </span>
        </div>
      </button>

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => onNavigate(theme.id)}
              className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-left"
            >
              {theme.title}
            </button>

            {/* Actions dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdownId(
                    activeDropdownId === theme.id ? null : theme.id,
                  );
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdownId === theme.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveDropdownId(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      className="absolute right-0 mt-2 w-40 max-w-[45] bg-card border border-border rounded-xl shadow-glass-md p-1.5 z-20"
                    >
                      <button
                        onClick={() => { onEdit(theme.id); setActiveDropdownId(null); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <PencilLine className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => onNavigate(theme.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open in Editor
                      </button>
                      <button
                        onClick={() => onToggleStatus(theme.id, theme.status)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        {theme.status === "published" ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Globe className="w-3.5 h-3.5" />
                        )}
                        Mark as{" "}
                        {theme.status === "published" ? "Draft" : "Published"}
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={() => onDelete(theme.id, theme.title)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Theme
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {theme.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {theme.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/60"
              >
                <Tag className="w-2.5 h-2.5 text-accent" />
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {theme.createdAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {theme.views.toLocaleString()} Views
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
