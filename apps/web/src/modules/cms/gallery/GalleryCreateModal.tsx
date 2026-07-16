"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Info, Tag, Image as ImageIcon, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryStatus } from "./gallery.types";
import { CATEGORIES } from "./gallery.data";
import { CoverImagePicker } from "@/modules/cms/blog-editor/CoverImagePicker";
import { TagMultiSelect } from "@/components/common/TagMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CmsGallerySaveDto } from "@/lib/api";

interface GalleryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: CmsGallerySaveDto) => Promise<void>;
  onError: (msg: string) => void;
  availableTags: string[];
  onTagCreate: (name: string) => Promise<void>;
}

export function GalleryCreateModal({
  isOpen,
  onClose,
  onCreate,
  onError,
  availableTags,
  onTagCreate,
}: GalleryCreateModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.gallery");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Digital Art");
  const [status, setStatus] = useState<GalleryStatus>("published");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("Digital Art");
    setStatus("published");
    setCoverUrl("");
    setTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onError("Please enter a gallery title");
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({
        title,
        description: description || "No description provided.",
        category,
        status,
        coverUrl,
        tags,
      });
      reset();
      onClose();
    } catch {
      onError("Failed to create gallery. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Matches Users table input style exactly
  const inputCls =
    "w-full px-3 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-sm text-sm outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm";
  const labelCls =
    "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

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
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Create New Gallery
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Initialize a workspace collection with preselected designs.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="p-1.5 h-auto w-auto text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
            >
              {/* Section 1: Core Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 1. Workspace Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Gallery Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Neon Shadows"
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
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
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
                    placeholder="Give a short concept brief about this showcase..."
                    rows={3}
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
              </div>

              {/* Section 2: Metadata & Tags */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> 2. Metadata & State
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <label className={labelCls}>Status Visibility</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        active={status === "published"}
                        onClick={() => setStatus("published")}
                        className="flex-1 py-3 h-auto rounded-sm text-xs font-bold"
                      >
                        <Globe className="w-3.5 h-3.5" /> Publish
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        active={status === "draft"}
                        onClick={() => setStatus("draft")}
                        className="flex-1 py-3 h-auto rounded-sm text-xs font-bold"
                      >
                        <Lock className="w-3.5 h-3.5" /> Draft
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={labelCls}>Tags</label>
                    <TagMultiSelect
                      value={tags}
                      onChange={setTags}
                      availableTags={availableTags}
                      onCreateTag={onTagCreate}
                      maxTags={8}
                      placeholder="Search or create a tag…"
                      onToast={(msg, type) => {
                        if (type === "error" || type === "warning") onError(msg);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Cover */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> 3. Cover Visuals
                </h3>
                <CoverImagePicker
                  value={coverUrl}
                  onChange={setCoverUrl}
                  subtype="gallery"
                  onToast={(msg, type) => {
                    if (type === "error" || type === "warning") onError(msg);
                  }}
                />
              </div>

              {/* Tip */}
              <div className="p-3 bg-muted/50 rounded-sm flex items-start gap-3 border border-border">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Tip:</span>{" "}
                  Starting as a draft lets you organize assets privately. Toggle
                  to Published when ready for public viewing.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/60 flex justify-end gap-3">
              <Button variant="ghost" radius="sm" className="h-auto py-3 font-semibold text-muted-foreground hover:text-foreground"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                radius="sm"
                disabled={submitting}
                className="px-5 py-3 h-auto font-semibold shadow-sm disabled:opacity-60"
                onClick={handleSubmit}
              >
                {submitting ? "Building…" : "Build Gallery"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
