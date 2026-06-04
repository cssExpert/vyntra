"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Globe, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gallery, GalleryStatus } from "./gallery.types";

interface GalleryTableProps {
  galleries: Gallery[];
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onToggleStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (id: string, title: string) => void;
}

export function GalleryTable({
  galleries, activeDropdownId, setActiveDropdownId, onToggleStatus, onDelete,
}: GalleryTableProps) {
  return (
    <motion.div
      key="table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-x-auto bg-card/30 border border-border rounded-2xl"
    >
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-background/50">
          <tr>
            {["Gallery Details", "Category", "Assets", "Created", "Status", "Views", ""].map((h) => (
              <th key={h} scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {galleries.map((gallery) => (
            <tr key={gallery.id} className="hover:bg-muted/20 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img src={gallery.coverUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{gallery.title}</div>
                    <div className="text-xs text-muted-foreground max-w-[250px] truncate mt-0.5">{gallery.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="bg-muted px-2.5 py-1 rounded-lg border border-border text-xs text-foreground">{gallery.category}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">{gallery.itemCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">{gallery.createdAt}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                  gallery.status === "published"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                )}>
                  {gallery.status === "published" ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">{gallery.views.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="relative inline-block text-left">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveDropdownId(activeDropdownId === gallery.id ? null : gallery.id); }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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
                          className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-glass-md p-1.5 z-20 text-left"
                        >
                          <button onClick={() => onToggleStatus(gallery.id, gallery.status)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors">
                            {gallery.status === "published" ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                            Mark as {gallery.status === "published" ? "Draft" : "Published"}
                          </button>
                          <div className="h-px bg-border my-1" />
                          <button onClick={() => onDelete(gallery.id, gallery.title)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete Gallery
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
