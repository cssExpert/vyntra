"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { EditorCard } from "./fields";
import { stripHtml, type AuthorProfile, type BlogFormState } from "./types";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
];
function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++)
    h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function authorInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return (
    ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() ||
    name.slice(0, 2).toUpperCase()
  );
}

export interface EditorSidebarProps {
  form: BlogFormState;
  seoScore: number;
  availableAuthors: AuthorProfile[];
  onInspect: () => void;
  patch: (partial: Partial<BlogFormState>) => void;
  readTimeManuallyEdited: boolean;
  onReadTimeManualEdit: () => void;
  onReadTimeAutoReset: () => void;
}

export function EditorSidebar({
  form,
  seoScore,
  availableAuthors,
  onInspect,
  patch,
  readTimeManuallyEdited,
  onReadTimeManualEdit,
  onReadTimeAutoReset,
}: EditorSidebarProps) {
  const author =
    availableAuthors.find((a) => a.id === form.author) ?? availableAuthors[0];
  const plainText = stripHtml(form.content);
  const wordCount = plainText
    ? plainText.split(/\s+/).filter(Boolean).length
    : 0;
  const circumference = 150;

  return (
    <div className="space-y-6">
      {/* SEO meter */}
      <EditorCard className="!p-5 space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
          SEO Optimizer Metric
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-muted fill-none"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="fill-none stroke-primary transition-all duration-500"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference - (circumference * seoScore) / 100
                }
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-foreground">
              {seoScore}%
            </span>
          </div>
          <div>
            <h4 className="text-xs md:text-sm lg:text-base font-bold text-foreground">
              {seoScore >= 80 ? "Perfect SEO Grade" : "Optimization Required"}
            </h4>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
              Fulfilling {seoScore / 20} of 5 keyword &amp; length parameters.
            </p>
          </div>
        </div>
      </EditorCard>

      {/* Writing stats */}
      <EditorCard className="!p-5 space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Writing Quality Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <span className="text-lg font-bold block text-primary">
              {wordCount}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
              Words
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-center gap-0.5">
              <input
                type="number"
                min={1}
                max={999}
                value={form.readTime}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value) || 1);
                  patch({ readTime: v });
                  onReadTimeManualEdit();
                }}
                className="text-lg font-bold text-primary bg-transparent w-9 text-center outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="Click to override read time"
              />
              <span className="text-sm font-bold text-primary">min</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                Est. Read Time
              </span>
              {readTimeManuallyEdited && (
                <button
                  type="button"
                  onClick={onReadTimeAutoReset}
                  title="Reset to auto-calculated value"
                  className="text-[8px] font-bold text-primary hover:underline leading-none"
                >
                  ↺ Auto
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
          {author ? (
            <>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${avatarColor(author.id)}`}
              >
                {authorInitials(author.name)}
              </span>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground block font-bold">
                  Assigned Publisher
                </span>
                <span className="text-xs font-bold block text-foreground">
                  {author.name}
                </span>
              </div>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Loading author…
            </span>
          )}
        </div>
      </EditorCard>

      {/* Inspect card */}
      <div className="p-5 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/10 border border-primary/20 text-center space-y-3">
        <Sparkles className="w-6 h-6 mx-auto text-primary" />
        <h4 className="text-xs md:text-sm lg:text-base font-bold text-foreground">
          Inspect devices live?
        </h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Render layout checks across mobile orientations before releasing.
        </p>
        <button
          type="button"
          onClick={onInspect}
          className="w-full py-2.5 bg-primary hover:bg-primary-600 text-primary-foreground text-xs md:text-sm font-bold rounded-xl transition-all"
        >
          Inspect Layout
        </button>
      </div>
    </div>
  );
}
