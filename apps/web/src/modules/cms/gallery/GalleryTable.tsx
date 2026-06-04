"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Globe, Lock, Trash2, Image as ImageIcon } from "lucide-react";
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
      className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="text-[13px] font-semibold text-muted-foreground select-none">
              {[
                { label: "Gallery Details", cls: "py-4 px-6" },
                { label: "Category", cls: "py-4 px-4" },
                { label: "Assets", cls: "py-4 px-4" },
                { label: "Created", cls: "py-4 px-4" },
                { label: "Status", cls: "py-4 px-4" },
                { label: "Views", cls: "py-4 px-4" },
                { label: "", cls: "py-4 px-6 text-right" },
              ].map(({ label, cls }) => (
                <th
                  key={label}
                  className={cn("sticky top-0 z-10 bg-muted border-b border-border font-semibold", cls)}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {galleries.length === 0 ? (
                <tr key="empty">
                  <td colSpan={7} className="py-12 text-center text-muted-foreground bg-muted/10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="text-muted-foreground/40 w-8 h-8" />
                      <p className="font-semibold text-foreground">No galleries found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or category filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                galleries.map((gallery) => (
                  <motion.tr
                    key={gallery.id}
                    layoutId={`gallery-row-${gallery.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/40 transition-colors"
                  >
                    {/* Title + thumbnail */}
                    <td className="py-4 px-6 font-bold text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
                          <img
                            src={gallery.coverUrl}
                            alt=""
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {gallery.title}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium max-w-[220px] truncate mt-0.5">
                            {gallery.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center bg-muted text-muted-foreground font-bold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider">
                        {gallery.category}
                      </span>
                    </td>

                    {/* Assets */}
                    <td className="py-4 px-4 text-muted-foreground tabular-nums whitespace-nowrap">
                      {gallery.itemCount}
                    </td>

                    {/* Created */}
                    <td className="py-4 px-4 text-muted-foreground font-medium whitespace-nowrap">
                      {gallery.createdAt}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center justify-center font-bold text-[11px] px-3 py-1 rounded-full",
                        gallery.status === "published"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}>
                        {gallery.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 text-muted-foreground font-medium tabular-nums whitespace-nowrap">
                      {gallery.views.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === gallery.id ? null : gallery.id);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
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
                                <button
                                  onClick={() => onToggleStatus(gallery.id, gallery.status)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                  {gallery.status === "published"
                                    ? <Lock className="w-3.5 h-3.5" />
                                    : <Globe className="w-3.5 h-3.5" />}
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
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer — matches Users table */}
      <div className="bg-muted/60 px-6 py-4 border-t border-border text-xs text-muted-foreground flex items-center justify-between font-medium">
        <span>Showing {galleries.length} {galleries.length === 1 ? "gallery" : "galleries"}</span>
        <span>Gallery Management Suite</span>
      </div>
    </motion.div>
  );
}
