"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Palette, Globe, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gallery, GalleryStatus } from "../gallery/gallery.types";
import { THEME_CATEGORIES } from "./themes.data";

interface ThemeEditModalProps {
  theme: Gallery | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Gallery>) => void;
}

const inputCls =
  "w-full px-3 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-sm text-sm outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm";
const labelCls =
  "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

const themeCategories = THEME_CATEGORIES.filter((c) => c !== "All");

export function ThemeEditModal({
  theme,
  onClose,
  onSave,
}: ThemeEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Portfolio");
  const [status, setStatus] = useState<GalleryStatus>("published");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Populate form whenever the theme prop changes
  useEffect(() => {
    if (!theme) return;
    setTitle(theme.title);
    setDescription(theme.description);
    setCategory(theme.category);
    setStatus(theme.status);
    setThumbnailUrl(theme.coverUrl.startsWith("data:") ? "" : theme.coverUrl);
    setTags([...theme.tags]);
    setTagInput("");
  }, [theme?.id]); // re-run only when a different theme is opened

  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
      setTagInput("");
    }
  };

  const handleSave = () => {
    if (!theme) return;
    onSave(theme.id, {
      title: title.trim() || theme.title,
      description: description.trim() || theme.description,
      category,
      status,
      coverUrl: thumbnailUrl.trim() || theme.coverUrl,
      tags: tags.length > 0 ? tags : theme.tags,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {theme && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="edit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            key="edit-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-2xl bg-card border border-border rounded-xl shadow-glass-lg overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-1.5 rounded-sm text-primary border border-primary/20">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Edit Theme
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update metadata for{" "}
                    <span className="font-semibold text-foreground">
                      {theme.title}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              {/* Name */}
              <div>
                <label className={labelCls}>
                  Theme Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aurora Dark"
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe this theme's style and audience…"
                  className={cn(inputCls, "resize-none")}
                />
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={cn(
                      inputCls,
                      "cursor-pointer font-semibold max-h-10.5",
                    )}
                  >
                    {themeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <div className="flex gap-2">
                    {(["published", "draft"] as GalleryStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={cn(
                          "flex-1 py-3 max-h-10.5 rounded-sm border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                          status === s
                            ? s === "published"
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-muted border-border text-foreground"
                            : "bg-background border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {s === "published" ? (
                          <Globe className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        {s === "published" ? "Published" : "Draft"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className={labelCls}>
                  Cover Image URL{" "}
                  <span className="normal-case font-normal text-muted-foreground/60">
                    (leave blank to keep current)
                  </span>
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/…"
                  className={inputCls}
                />
              </div>

              {/* Tags */}
              <div>
                <label className={labelCls}>Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Tag & press Enter…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className={cn(inputCls, "flex-1")}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2.5 inline-flex items-center gap-1 bg-muted hover:bg-muted/80 text-foreground rounded-sm text-xs font-bold transition-colors border border-border"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 p-3 bg-muted/50 border border-border rounded-sm">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 py-1 pl-2.5 pr-1.5 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="p-0.5 rounded-full hover:bg-primary/20"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/60 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-primary-foreground rounded-sm text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
