"use client";

import { MoveLeft, MoveRight, Tag } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import type { BlogFormState } from "./types";
import IconTitle from "@/components/common/IconTitle";
import { Button } from "@/components/ui/button";
import { TagMultiSelect } from "@/components/common/TagMultiSelect";

export interface MetadataTabProps {
  form: BlogFormState;
  patch: (partial: Partial<BlogFormState>) => void;
  availableCategories: string[];
  availableTags: string[];
  onTagCreate: (name: string) => Promise<void>;
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
  availableCategories,
  availableTags,
  onTagCreate,
  onBack,
  onNext,
  onToast,
}: MetadataTabProps) {
  return (
    <EditorCard className="space-y-6">
      {/* Title */}
      <IconTitle
        title="Categorize and Index Content"
        titleClassName="text-sm md:text-base lg:text-lg font-bold text-foreground"
        icon={Tag}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <FieldLabel
            right={
              form.category.length > 0 ? (
                <span className="normal-case text-[10px] font-bold text-primary tracking-normal">
                  {form.category.length} selected
                </span>
              ) : undefined
            }
          >
            Categories
          </FieldLabel>
          {availableCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No categories yet.{" "}
              <a
                href="/cms/blog-categories"
                className="text-primary underline underline-offset-2"
              >
                Create categories
              </a>{" "}
              to start tagging posts.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map((cat) => {
                const selected = form.category.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      patch({
                        category: selected
                          ? form.category.filter((c) => c !== cat)
                          : [...form.category, cat],
                      })
                    }
                    className={`py-2 px-3 rounded-lg border text-xs text-left font-semibold transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                        selected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4L3 5.5L6.5 2"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags — shared org tag catalog */}
        <div>
          <FieldLabel
            right={
              form.tags.length > 0 ? (
                <span className="normal-case text-[10px] font-bold text-primary tracking-normal">
                  {form.tags.length}/8 tags
                </span>
              ) : undefined
            }
          >
            Tags
          </FieldLabel>
          <TagMultiSelect
            value={form.tags}
            onChange={(next) => patch({ tags: next })}
            availableTags={availableTags}
            onCreateTag={onTagCreate}
            maxTags={8}
            onToast={onToast}
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
        <Button
          variant="muted"
          radius="lg"
          className="h-auto px-4 py-2.5 gap-1 text-xs font-semibold"
          type="button"
          onClick={onBack}
        >
          <MoveLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>
        <Button
          variant="muted"
          radius="lg"
          className="h-auto px-4 py-2.5 gap-1 text-xs font-semibold"
          type="button"
          onClick={onNext}
        >
          <span>Next: SEO Config</span>
          <MoveRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </EditorCard>
  );
}
