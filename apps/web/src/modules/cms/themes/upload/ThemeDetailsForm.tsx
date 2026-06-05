"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_CATEGORIES } from "../themes.data";
import type { ThemeFormData } from "../upload-types";

interface ThemeDetailsFormProps {
  data: ThemeFormData;
  onChange: (d: ThemeFormData) => void;
}

const inputCls =
  "w-full px-3 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-sm text-sm outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm";
const labelCls =
  "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

const themeCategories = THEME_CATEGORIES.filter((c) => c !== "All");

export function ThemeDetailsForm({ data, onChange }: ThemeDetailsFormProps) {
  const [tagInput, setTagInput] = useState("");

  const set = <K extends keyof ThemeFormData>(key: K, value: ThemeFormData[K]) =>
    onChange({ ...data, [key]: value });

  const addTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = tagInput.trim();
    if (clean && !data.tags.includes(clean)) {
      set("tags", [...data.tags, clean]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => set("tags", data.tags.filter((t) => t !== tag));

  return (
    <div className="space-y-5">
      {/* Theme Name — full width */}
      <div>
        <label className={labelCls}>
          Theme Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Aurora Dark"
          className={inputCls}
        />
      </div>

      {/* Description — full width */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the style, purpose, and audience for this theme..."
          rows={3}
          className={cn(inputCls, "resize-none")}
        />
      </div>

      {/* Category + Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={data.category}
            onChange={(e) => set("category", e.target.value)}
            className={cn(inputCls, "cursor-pointer font-semibold")}
          >
            {themeCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            Author Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={data.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="e.g. Jane Doe"
            className={inputCls}
          />
        </div>
      </div>

      {/* Version + Thumbnail URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Version</label>
          <input
            type="text"
            value={data.version}
            onChange={(e) => set("version", e.target.value)}
            placeholder="1.0.0"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Thumbnail URL <span className="text-muted-foreground/60 lowercase normal-case font-normal">(optional)</span></label>
          <input
            type="url"
            value={data.thumbnailUrl}
            onChange={(e) => set("thumbnailUrl", e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={inputCls}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Tag name & press Enter..."
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            className={cn(inputCls, "flex-1")}
          />
          <button
            type="button"
            onClick={() => addTag()}
            className="px-3 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-sm text-xs font-bold transition-colors border border-border cursor-pointer"
          >
            Add
          </button>
        </div>

        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 p-3 bg-muted/50 border border-border rounded-sm">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 py-1 pl-2.5 pr-1.5 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="p-0.5 rounded-full hover:bg-primary/20 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
