"use client";

import React from "react";
import { BookOpenText, MoveRight } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import { CoverImagePicker } from "./CoverImagePicker";
import { RichTextEditor } from "./RichTextEditor";
import { stripHtml, type BlogFormState } from "./types";
import IconTitle from "@/components/common/IconTitle";
import { Input } from "@/components/ui/input";

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
  const wordCount = React.useMemo(() => {
    const plain = stripHtml(form.content);
    return plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  }, [form.content]);

  return (
    <EditorCard className="space-y-5">
      {/* Title */}
      <IconTitle
        title="Content Studio"
        titleClassName="text-sm md:text-base font-bold text-foreground"
        icon={BookOpenText}
        iconClassName="w-4 h-4 text-primary"
      />
      <div>
        <FieldLabel>Blog Post Title</FieldLabel>
        <Input
          size="xl"
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="e.g. 10 Online Shopping Tips for Smart Buyers..."
        />
      </div>

      {/* Subtitle + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Subtitle / Hook Line</FieldLabel>
          <Input
            size="lg"
            value={form.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            placeholder="Catchy reader hook summary..."
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
            <Input
              size="lg"
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
        subtype="blogs"
        onToast={onToast}
      />

      {/* Content */}
      <RichTextEditor
        value={form.content}
        onChange={(content) => patch({ content })}
      />

      {/* Live writing stats */}
      <div className="flex items-center gap-3 px-1 -mt-1 text-xs md:text-sm text-muted-foreground font-medium select-none">
        <span>
          <span className="font-bold text-foreground">
            {wordCount.toLocaleString()}
          </span>{" "}
          words
        </span>
        <span className="text-border">·</span>
        <span>
          <span className="font-bold text-foreground">{form.readTime}</span> min
          read
        </span>
        {wordCount > 0 && (
          <>
            <span className="text-border">·</span>
            <span>
              <span className="font-bold text-foreground">
                {Math.round(wordCount * 5.1).toLocaleString()}
              </span>{" "}
              chars
            </span>
          </>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2.5 bg-muted text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-muted/70 transition-all"
        >
          <span>Next: Metadata Tags</span>
          <MoveRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </EditorCard>
  );
}
