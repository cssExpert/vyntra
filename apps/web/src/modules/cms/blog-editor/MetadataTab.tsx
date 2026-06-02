"use client";

import React from "react";
import { Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import { TagInput } from "./TagInput";
import { CATEGORIES, type BlogFormState } from "./types";

export interface MetadataTabProps {
  form: BlogFormState;
  patch: (partial: Partial<BlogFormState>) => void;
  onBack: () => void;
  onNext: () => void;
  onToast?: (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
}

export function MetadataTab({
  form,
  patch,
  onBack,
  onNext,
  onToast,
}: MetadataTabProps) {
  return (
    <EditorCard className="space-y-6">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        <span>Categorize and Index Content</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <FieldLabel>Primary Category</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => patch({ category: cat })}
                className={`py-2 px-3 rounded-lg border text-xs text-left font-semibold transition-all ${
                  form.category === cat
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <FieldLabel>Custom Tags</FieldLabel>
          <TagInput
            tags={form.tags}
            onChange={(tags) => patch({ tags })}
            onLimit={() => onToast?.("Limit of 8 tags reached", "warning")}
          />
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <FieldLabel>Post Excerpt / Meta Snippet Hook</FieldLabel>
        <textarea
          rows={3}
          value={form.excerpt}
          onChange={(e) => patch({ excerpt: e.target.value })}
          placeholder="Provide a compelling 1-2 sentence hook for feed pages…"
          className={inputClass}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 bg-muted text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-muted/70 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-3 py-1.5 bg-muted text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-muted/70 transition-all"
        >
          <span>Next: SEO Config</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </EditorCard>
  );
}
