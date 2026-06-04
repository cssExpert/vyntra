"use client";

import React from "react";
import { Settings, ArrowLeft, Check, CheckCircle } from "lucide-react";
import { EditorCard, FieldLabel } from "./fields";
import { DatePickerField } from "@/components/common/DatePickerField";
import { TimePickerField } from "@/components/common/TimePickerField";
import {
  AUTHOR_PROFILES,
  type BlogEditorStatus,
  type BlogFormState,
  type BlogVisibility,
} from "./types";

export interface PublishTabProps {
  form: BlogFormState;
  patch: (partial: Partial<BlogFormState>) => void;
  onBack: () => void;
  onPublish: () => void;
}

const STATUSES: { id: BlogEditorStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Schedule" },
  { id: "published", label: "Public" },
];

const VISIBILITY: { id: BlogVisibility; title: string; desc: string }[] = [
  { id: "public", title: "Open Access", desc: "Indexed by crawlers and visible to everyone." },
  { id: "private", title: "Private / Admins Only", desc: "Accessible only by internal team credentials." },
  { id: "members", title: "Members Restricted", desc: "Requires active community account verification." },
];

const TOGGLES: { label: string; prop: keyof BlogFormState }[] = [
  { label: "Allow interactive user discussions", prop: "allowComments" },
  { label: "Feature post on ERVFlow home carousel", prop: "isFeatured" },
  { label: "Pin content to top of index feeds", prop: "pinToTop" },
];

export function PublishTab({ form, patch, onBack, onPublish }: PublishTabProps) {
  return (
    <EditorCard className="space-y-6">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Settings className="w-4 h-4 text-primary" />
        <span>Audience &amp; Launch Visibility</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: schedule + visibility */}
        <div className="space-y-4">
          <div>
            <FieldLabel>Release Schedule</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => patch({ status: st.id })}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    form.status === st.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {form.status === "scheduled" && (
            <div className="p-3.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1.5">
                  Date
                </label>
                <DatePickerField
                  value={form.publishDate}
                  onChange={(publishDate) => patch({ publishDate })}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1.5">
                  Time
                </label>
                <TimePickerField
                  value={form.publishTime}
                  onChange={(publishTime) => patch({ publishTime })}
                />
              </div>
            </div>
          )}

          <div>
            <FieldLabel>Visibility Status</FieldLabel>
            <div className="space-y-2">
              {VISIBILITY.map((vis) => (
                <button
                  key={vis.id}
                  type="button"
                  onClick={() => patch({ visibility: vis.id })}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 ${
                    form.visibility === vis.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <span className="mt-0.5 w-3 h-3 rounded-full border border-muted-foreground/50 flex items-center justify-center shrink-0">
                    {form.visibility === vis.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span>
                    <span className="font-semibold block text-foreground">
                      {vis.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {vis.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: author + toggles */}
        <div className="space-y-4">
          <div>
            <FieldLabel>Assign Active Author</FieldLabel>
            <div className="space-y-2">
              {AUTHOR_PROFILES.map((aut) => (
                <button
                  key={aut.id}
                  type="button"
                  onClick={() => patch({ author: aut.id })}
                  className={`w-full p-2 rounded-lg border flex items-center justify-between text-xs transition-all ${
                    form.author === aut.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aut.avatar}
                      alt={aut.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-left">
                      <span className="font-semibold block text-foreground">
                        {aut.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {aut.role}
                      </span>
                    </span>
                  </span>
                  {form.author === aut.id && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <FieldLabel>Extra Controls</FieldLabel>
            {TOGGLES.map((opt) => (
              <label
                key={opt.prop}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs cursor-pointer select-none"
              >
                <span className="text-foreground">{opt.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(form[opt.prop])}
                  onChange={(e) => patch({ [opt.prop]: e.target.checked })}
                  className="w-4 h-4 rounded-sm border-border accent-primary"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2 border-t border-border">
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
          onClick={onPublish}
          className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-lg flex items-center gap-1 transition-all active:scale-95"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Confirm &amp; Publish</span>
        </button>
      </div>
    </EditorCard>
  );
}
