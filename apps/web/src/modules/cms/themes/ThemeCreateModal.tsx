"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Palette,
  Info,
  Tag,
  Image as ImageIcon,
  Globe,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gallery, GalleryStatus } from "../gallery/gallery.types";
import { PRESET_COVERS } from "../gallery/gallery.data";
import { THEME_CATEGORIES } from "./themes.data";

interface ThemeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (theme: Gallery) => void;
  onError: (msg: string) => void;
}

export function ThemeCreateModal({
  isOpen,
  onClose,
  onCreate,
  onError,
}: ThemeCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Portfolio");
  const [status, setStatus] = useState<GalleryStatus>("published");
  const [sections, setSections] = useState(8);
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [useCustomCover, setUseCustomCover] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("Portfolio");
    setStatus("published");
    setSections(8);
    setCoverUrl(PRESET_COVERS[0].url);
    setCustomCoverUrl("");
    setTags([]);
    setTagInput("");
    setUseCustomCover(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onError("Please enter a theme name.");
      return;
    }
    const finalCover =
      useCustomCover && customCoverUrl.trim()
        ? customCoverUrl.trim()
        : coverUrl;
    onCreate({
      id: `theme-${Date.now()}`,
      title,
      description: description || "No description provided.",
      category,
      itemCount: sections,
      createdAt: new Date().toISOString().split("T")[0],
      status,
      coverUrl: finalCover,
      tags: tags.length > 0 ? tags : ["Custom"],
      views: 0,
    });
    reset();
    onClose();
  };

  const inputCls =
    "w-full px-3 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-sm text-sm outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm";
  const labelCls =
    "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

  const themeCategories = THEME_CATEGORIES.filter((c) => c !== "All");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-glass-lg overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-1.5 rounded-sm text-primary border border-primary/20">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Add New Theme
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Register a new design theme to your collection.
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
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
            >
              {/* 1. Theme Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 1. Theme Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Theme Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Aurora Dark"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={cn(inputCls, "cursor-pointer font-semibold")}
                    >
                      {themeCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the style, purpose, and audience for this theme..."
                    rows={3}
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
              </div>

              {/* 2. Metadata */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> 2. Metadata & State
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status */}
                  <div>
                    <label className={labelCls}>Status</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus("published")}
                        className={cn(
                          "flex-1 py-3 rounded-sm border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                          status === "published"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Globe className="w-3.5 h-3.5" /> Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("draft")}
                        className={cn(
                          "flex-1 py-3 rounded-sm border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                          status === "draft"
                            ? "bg-muted border-border text-foreground"
                            : "bg-background border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Lock className="w-3.5 h-3.5" /> Draft
                      </button>
                    </div>
                  </div>

                  {/* Sections */}
                  <div>
                    <label className={labelCls}>No. of Sections</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={sections}
                      onChange={(e) => setSections(Number(e.target.value))}
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
                        placeholder="Tag & press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(e);
                          }
                        }}
                        className={cn(inputCls, "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-sm text-xs font-bold transition-colors border border-border"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 border border-border rounded-sm">
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

              {/* 3. Cover Image */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> 3. Cover Image
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Custom URL
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCustomCover(!useCustomCover)}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none",
                        useCustomCover
                          ? "bg-primary"
                          : "bg-muted border border-border",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                          useCustomCover ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {useCustomCover ? (
                  <div>
                    <label className={labelCls}>Cover Image URL</label>
                    <input
                      type="url"
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className={inputCls}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Use high-quality images from Unsplash or Pexels.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {PRESET_COVERS.map((preset) => {
                      const isSelected = coverUrl === preset.url;
                      return (
                        <button
                          type="button"
                          key={preset.id}
                          onClick={() => setCoverUrl(preset.url)}
                          className={cn(
                            "relative aspect-square rounded-sm overflow-hidden border focus:outline-none transition-all",
                            isSelected
                              ? "border-primary ring-2 ring-primary/50"
                              : "border-border opacity-60 hover:opacity-100",
                          )}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="p-3 bg-muted/50 rounded-sm flex items-start gap-3 border border-border">
                <Palette className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Tip:</span> After
                  adding a theme, open it in the Editor to customize sections,
                  colors, and layout from scratch or via a template.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-3 bg-primary hover:bg-primary-600 text-primary-foreground rounded-sm text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
              >
                Add Theme
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
