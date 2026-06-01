"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import { CoverImagePicker } from "./CoverImagePicker";
import { MarkdownEditor } from "./MarkdownEditor";
import type { BlogFormState } from "./types";

export interface WritingTabProps {
  form: BlogFormState;
  patch: (partial: Partial<BlogFormState>) => void;
  slugManuallyEdited: boolean;
  setSlugManuallyEdited: (v: boolean) => void;
  onNext: () => void;
  onToast?: (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
}

export function WritingTab({
  form,
  patch,
  slugManuallyEdited,
  setSlugManuallyEdited,
  onNext,
  onToast,
}: WritingTabProps) {
  return (
    <EditorCard className="space-y-5">
      {/* Title */}
      <div>
        <FieldLabel>Blog Post Title</FieldLabel>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="e.g. 10 Online Shopping Tips for Smart Buyers…"
          className={`${inputClass} !py-3 font-bold !text-base`}
        />
      </div>

      {/* Subtitle + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Subtitle / Hook Line</FieldLabel>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            placeholder="Catchy reader hook summary…"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel
            right={
              slugManuallyEdited ? (
                <button
                  type="button"
                  onClick={() => setSlugManuallyEdited(false)}
                  className="text-primary text-[9px] font-bold hover:underline"
                >
                  Auto Sync
                </button>
              ) : undefined
            }
          >
            Live URL Slug
          </FieldLabel>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
              /blog/
            </span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                patch({ slug: e.target.value });
              }}
              className={`${inputClass} !pl-14 font-mono`}
            />
          </div>
        </div>
      </div>

      {/* Cover */}
      <CoverImagePicker
        value={form.coverImage}
        onChange={(coverImage) => patch({ coverImage })}
        onToast={onToast}
      />

      {/* Content */}
      <MarkdownEditor
        value={form.content}
        onChange={(content) => patch({ content })}
      />

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="px-3 py-1.5 bg-muted text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-muted/70 transition-all"
        >
          <span>Next: Metadata Tags</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </EditorCard>
  );
}
