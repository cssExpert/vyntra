"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Info, Tag, Image as ImageIcon, Globe, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Gallery, GalleryStatus } from "./gallery.types";
import { PRESET_COVERS, CATEGORIES } from "./gallery.data";

interface GalleryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (gallery: Gallery) => void;
  onError: (msg: string) => void;
}

export function GalleryCreateModal({ isOpen, onClose, onCreate, onError }: GalleryCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Digital Art");
  const [status, setStatus] = useState<GalleryStatus>("published");
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [useCustomCover, setUseCustomCover] = useState(false);

  const reset = () => {
    setTitle(""); setDescription(""); setCategory("Digital Art");
    setStatus("published"); setCoverUrl(PRESET_COVERS[0].url);
    setCustomCoverUrl(""); setTags([]); setTagInput(""); setUseCustomCover(false);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) { setTags([...tags, clean]); setTagInput(""); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { onError("Please enter a gallery title"); return; }
    const finalCover = useCustomCover && customCoverUrl.trim() ? customCoverUrl.trim() : coverUrl;
    onCreate({
      id: `gal-${Date.now()}`,
      title,
      description: description || "No description provided.",
      category,
      itemCount: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date().toISOString().split("T")[0],
      status,
      coverUrl: finalCover,
      tags: tags.length > 0 ? tags : ["General"],
      views: 0,
    });
    reset();
    onClose();
  };

  const inputCls = "w-full bg-background border border-border rounded-xl py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

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
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-glass-lg overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-1.5 rounded-lg text-primary border border-primary/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Create New Gallery</h2>
                  <p className="text-xs text-muted-foreground">Initialize a workspace collection with preselected designs.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {/* Section 1 */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 1. Workspace Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Gallery Title <span className="text-destructive">*</span>
                    </label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Neon Shadows" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={cn(inputCls, "cursor-pointer text-foreground")}>
                      {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Give a short concept brief about this showcase..." rows={3} className={cn(inputCls, "resize-none")} />
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> 2. Metadata & State
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Status Visibility</label>
                    <div className="grid grid-cols-2 gap-2 bg-background p-1 border border-border rounded-xl">
                      <button type="button" onClick={() => setStatus("published")} className={cn("py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5", status === "published" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground")}>
                        <Globe className="w-3.5 h-3.5" /> Publish
                      </button>
                      <button type="button" onClick={() => setStatus("draft")} className={cn("py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5", status === "draft" ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:text-foreground")}>
                        <Lock className="w-3.5 h-3.5" /> Draft
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Add Tag Chips</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Type tag & enter..."
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(e); } }}
                        className={cn(inputCls, "flex-1")}
                      />
                      <button type="button" onClick={handleAddTag} className="bg-muted hover:bg-muted/80 text-foreground px-3 rounded-xl text-xs font-bold transition-colors border border-border">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-background/50 border border-border/80 rounded-xl">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 py-1 pl-2.5 pr-1.5 rounded-full">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="p-0.5 rounded-full hover:bg-primary/20">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3 */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> 3. Cover Visuals
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Custom URL</span>
                    <button
                      type="button"
                      onClick={() => setUseCustomCover(!useCustomCover)}
                      className={cn("w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none", useCustomCover ? "bg-primary" : "bg-muted border border-border")}
                    >
                      <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", useCustomCover ? "translate-x-4" : "translate-x-0")} />
                    </button>
                  </div>
                </div>
                {useCustomCover ? (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Direct Cover Image URL</label>
                    <input type="url" value={customCoverUrl} onChange={(e) => setCustomCoverUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls} />
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Use high-quality images from Unsplash or Pexels.</p>
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
                          className={cn("group relative aspect-square rounded-xl overflow-hidden border focus:outline-none transition-all", isSelected ? "border-primary ring-2 ring-primary/50" : "border-border opacity-60 hover:opacity-100 hover:border-border/80")}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
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

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Tip:</span>{" "}
                  Starting as a draft lets you organize assets privately. Toggle to Published when ready for public viewing.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-background hover:bg-muted text-muted-foreground hover:text-foreground font-semibold rounded-xl text-xs transition-colors border border-border">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs transition-colors shadow-glow-brand">
                Build Gallery
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
