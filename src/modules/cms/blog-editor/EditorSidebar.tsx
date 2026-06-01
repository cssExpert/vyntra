"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { EditorCard } from "./fields";
import { AUTHOR_PROFILES, type BlogFormState } from "./types";

export interface EditorSidebarProps {
  form: BlogFormState;
  seoScore: number;
  onInspect: () => void;
}

export function EditorSidebar({ form, seoScore, onInspect }: EditorSidebarProps) {
  const author =
    AUTHOR_PROFILES.find((a) => a.id === form.author) ?? AUTHOR_PROFILES[0];
  const wordCount = form.content.split(/\s+/).filter(Boolean).length;
  const circumference = 150;

  return (
    <div className="space-y-6">
      {/* SEO meter */}
      <EditorCard className="!p-5 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                strokeDashoffset={circumference - (circumference * seoScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-foreground">
              {seoScore}%
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {seoScore >= 80 ? "Perfect SEO Grade" : "Optimization Required"}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Fulfilling {seoScore / 20} of 5 keyword &amp; length parameters.
            </p>
          </div>
        </div>
      </EditorCard>

      {/* Writing stats */}
      <EditorCard className="!p-5 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
            <span className="text-lg font-bold block text-primary">
              {form.readTime} min
            </span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
              Est. Read Time
            </span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={author.avatar}
            alt={author.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground block font-bold">
              Assigned Publisher
            </span>
            <span className="text-xs font-bold block text-foreground">
              {author.name}
            </span>
          </div>
        </div>
      </EditorCard>

      {/* Inspect card */}
      <div className="p-5 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/10 border border-primary/20 text-center space-y-3">
        <Sparkles className="w-6 h-6 mx-auto text-primary" />
        <h4 className="text-xs font-bold text-foreground">Inspect devices live?</h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Render layout checks across mobile orientations before releasing.
        </p>
        <button
          type="button"
          onClick={onInspect}
          className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all"
        >
          Inspect Layout
        </button>
      </div>
    </div>
  );
}
