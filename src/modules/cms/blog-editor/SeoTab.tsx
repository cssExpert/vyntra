"use client";

import React from "react";
import { Globe, ArrowLeft, ArrowRight } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import type { BlogFormState } from "./types";

export interface SeoTabProps {
  form: BlogFormState;
  patch: (partial: Partial<BlogFormState>) => void;
  setSeoTitleManuallyEdited: (v: boolean) => void;
  setSeoDescManuallyEdited: (v: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SeoTab({
  form,
  patch,
  setSeoTitleManuallyEdited,
  setSeoDescManuallyEdited,
  onBack,
  onNext,
}: SeoTabProps) {
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <EditorCard className="space-y-6">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <span>Search Engine Optimization (SEO)</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <FieldLabel>Meta Page Title</FieldLabel>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => {
                setSeoTitleManuallyEdited(true);
                patch({ seoTitle: e.target.value });
              }}
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Meta Description</FieldLabel>
            <textarea
              rows={3}
              value={form.seoDesc}
              onChange={(e) => {
                setSeoDescManuallyEdited(true);
                patch({ seoDesc: e.target.value });
              }}
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Target Search Keywords</FieldLabel>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => patch({ keywords: e.target.value })}
              placeholder="e.g. workspace, productivity, designer"
              className={inputClass}
            />
          </div>
        </div>

        {/* Google snippet preview */}
        <div className="space-y-4">
          <FieldLabel>Google Snippet Preview</FieldLabel>
          <div className="p-4 rounded-xl bg-white text-slate-800 border border-slate-200 space-y-1.5 shadow-sm">
            <p className="text-[10px] text-slate-500 font-mono">
              https://vyntra.io/blog/{form.slug || "untitled-post"}
            </p>
            <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer">
              {form.seoTitle || form.title || "Untitled Post Title"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              <span className="text-slate-400 mr-1">{todayLabel} —</span>
              {form.seoDesc ||
                form.excerpt ||
                "Write post details to fill the Google search description preview…"}
            </p>
          </div>
        </div>
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
          <span>Next: Visibility</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </EditorCard>
  );
}
