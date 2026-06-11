"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tag, MoveLeft, MoveRight, Plus, X, Search } from "lucide-react";
import { EditorCard, FieldLabel, inputClass } from "./fields";
import type { BlogFormState } from "./types";
import IconTitle from "@/components/common/IconTitle";

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
  const [tagSearch, setTagSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cleanSearch = tagSearch.trim().replace(/[^a-zA-Z0-9\s\-_]/g, "");

  const filtered = availableTags.filter(
    (t) =>
      !form.tags.includes(t) &&
      t.toLowerCase().includes(cleanSearch.toLowerCase()),
  );

  const exactMatch = availableTags.some(
    (t) => t.toLowerCase() === cleanSearch.toLowerCase(),
  );
  const canCreate = cleanSearch.length > 0 && !exactMatch;

  const addTag = async (name: string) => {
    if (form.tags.length >= 8) {
      onToast?.("Limit of 8 tags reached", "warning");
      return;
    }
    if (form.tags.includes(name)) return;

    const isNew = !availableTags.some(
      (t) => t.toLowerCase() === name.toLowerCase(),
    );

    patch({ tags: [...form.tags, name] });
    setTagSearch("");
    setShowDropdown(false);

    if (isNew) {
      setCreating(true);
      await onTagCreate(name);
      setCreating(false);
    }
  };

  const removeTag = (tag: string) =>
    patch({ tags: form.tags.filter((t) => t !== tag) });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && cleanSearch) {
      e.preventDefault();
      const match = availableTags.find(
        (t) => t.toLowerCase() === cleanSearch.toLowerCase(),
      );
      addTag(match ?? cleanSearch);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      setTagSearch("");
    }
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <EditorCard className="space-y-6">
      {/* Title */}
      <IconTitle
        title="Categorize and Index Content"
        titleClassName="text-sm md:text-base font-bold text-foreground"
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

        {/* Tags — DB-backed */}
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

          {/* Selected tags */}
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-500 transition-colors ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search / create input */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder={
                  form.tags.length >= 8
                    ? "Tag limit reached"
                    : "Search or create a tag…"
                }
                disabled={form.tags.length >= 8}
                className={`${inputClass} !pl-9 !py-2 text-xs disabled:opacity-50`}
              />
              {creating && (
                <span className="absolute right-3 text-[9px] text-muted-foreground font-bold animate-pulse">
                  saving…
                </span>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (filtered.length > 0 || canCreate) && (
              <div
                ref={dropdownRef}
                className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-44 overflow-y-auto"
              >
                {filtered.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addTag(tag);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted transition-colors"
                  >
                    <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground">#{tag}</span>
                  </button>
                ))}
                {canCreate && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addTag(cleanSearch);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-primary/5 transition-colors border-t border-border text-primary font-semibold"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    <span>Create &ldquo;#{cleanSearch}&rdquo;</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Available tags as quick-select pills */}
          {availableTags.length > 0 && (
            <div className="mt-2.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Available
              </p>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter((t) => !form.tags.includes(t))
                  .slice(0, 16)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={form.tags.length >= 8}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>#{tag}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
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
          className="px-4 py-2.5 bg-muted text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-muted/70 transition-all"
        >
          <MoveLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2.5 bg-muted text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-muted/70 transition-all"
        >
          <span>Next: SEO Config</span>
          <MoveRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </EditorCard>
  );
}
