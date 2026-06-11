"use client";

import React from "react";
import { Globe, MoveLeft, MoveRight } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import type { BlogFormState } from "./types";
import IconTitle from "@/components/common/IconTitle";
import { Button } from "@/components/ui/button";

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

  // Site base URL from the org's configured domain (CMS Settings → Domain).
  const { previewUrl } = useSitePreviewUrl();
  const siteBaseUrl = previewUrl() ?? "https://vyntra.io";

  return (
    <EditorCard className="space-y-6">
      {/* Title */}
      <IconTitle
        title="Search Engine Optimization (SEO)"
        titleClassName="text-sm md:text-base lg:text-lg font-bold text-foreground"
        icon={Globe}
      />

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
            <p className="text-xs text-slate-500 font-mono">
              {siteBaseUrl}/blog/{form.slug || "untitled-post"}
            </p>
            <h4 className="text-base font-semibold text-brand-700 underline hover:no-underline cursor-pointer">
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
        <Button
          variant="muted"
          radius="lg"
          className="h-auto px-3 py-2.5 gap-1 text-xs font-semibold"
          type="button"
          onClick={onBack}
        >
          <MoveLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>
        <Button
          variant="muted"
          radius="lg"
          className="h-auto px-3 py-2.5 gap-1 text-xs font-semibold"
          type="button"
          onClick={onNext}
        >
          <span>Next: Visibility</span>
          <MoveRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </EditorCard>
  );
}
