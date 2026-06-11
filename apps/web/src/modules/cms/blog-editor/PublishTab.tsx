"use client";

import React from "react";
import {
  Settings,
  MoveLeft,
  Check,
  CheckCircle,
  FileText,
  Clock,
  Globe,
  Lock,
  Users,
} from "lucide-react";
import { EditorCard, FieldLabel } from "./fields";
import { DatePickerField } from "@/components/common/DatePickerField";
import { TimePickerField } from "@/components/common/TimePickerField";
import {
  type AuthorProfile,
  type BlogEditorStatus,
  type BlogFormState,
  type BlogVisibility,
} from "./types";
import IconTitle from "@/components/common/IconTitle";
import { Button } from "@/components/ui/button";

export interface PublishTabProps {
  form: BlogFormState;
  patch: (partial: Partial<BlogFormState>) => void;
  availableAuthors: AuthorProfile[];
  onBack: () => void;
  onPublish: () => void;
}

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() ||
    name.slice(0, 2).toUpperCase()
  );
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUSES: {
  id: BlogEditorStatus;
  label: string;
  desc: string;
  icon: React.ElementType;
  activeClass: string;
}[] = [
  {
    id: "draft",
    label: "Draft",
    desc: "Save privately. Not visible to readers.",
    icon: FileText,
    activeClass: "border-amber-500 bg-amber-500/10 text-amber-600",
  },
  {
    id: "scheduled",
    label: "Schedule",
    desc: "Auto-publish at a chosen date & time.",
    icon: Clock,
    activeClass: "border-blue-500 bg-blue-500/10 text-blue-600",
  },
  {
    id: "published",
    label: "Publish",
    desc: "Live now. Visible to your audience.",
    icon: Globe,
    activeClass: "border-emerald-500 bg-emerald-500/10 text-emerald-600",
  },
];

const VISIBILITY: {
  id: BlogVisibility;
  title: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: "public",
    title: "Open Access",
    desc: "Indexed by crawlers and visible to everyone.",
    icon: Globe,
  },
  {
    id: "private",
    title: "Private / Admins Only",
    desc: "Accessible only by internal team credentials.",
    icon: Lock,
  },
  {
    id: "members",
    title: "Members Restricted",
    desc: "Requires active community account verification.",
    icon: Users,
  },
];

const TOGGLES: { label: string; prop: keyof BlogFormState }[] = [
  { label: "Allow interactive user discussions", prop: "allowComments" },
  { label: "Feature post on ERVFlow home carousel", prop: "isFeatured" },
  { label: "Pin content to top of index feeds", prop: "pinToTop" },
];

export function PublishTab({
  form,
  patch,
  availableAuthors,
  onBack,
  onPublish,
}: PublishTabProps) {
  return (
    <EditorCard className="@container space-y-6">
      {/* Title */}
      <IconTitle
        title="Audience &amp; Launch Visibility"
        titleClassName="text-sm md:text-base lg:text-lg font-bold text-foreground"
        icon={Settings}
      />

      <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
        {/* Left: schedule + visibility */}
        <div className="space-y-4">
          <div>
            <FieldLabel>Release Schedule</FieldLabel>
            <div className="space-y-2">
              {STATUSES.map((st) => {
                const Icon = st.icon;
                const active = form.status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => patch({ status: st.id })}
                    className={`w-full p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      active
                        ? st.activeClass
                        : "bg-background border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? "bg-white/90" : "bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 text-left">
                      <span className="font-semibold block text-xs md:text-sm">
                        {st.label}
                      </span>
                      <span className="text-[10px] opacity-70">{st.desc}</span>
                    </span>
                    {active && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {(form.status === "scheduled" || form.status === "published") && (
            <div
              className={`p-3.5 rounded-lg border border-dashed grid grid-cols-2 gap-3 ${
                form.status === "scheduled"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-emerald-500/30 bg-emerald-500/5"
              }`}
            >
              <div className="col-span-2">
                <p className="text-[9px] uppercase font-bold text-muted-foreground mb-2">
                  {form.status === "scheduled" ? "Publish at" : "Published on"}
                </p>
              </div>
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
              {VISIBILITY.map((vis) => {
                const Icon = vis.icon;
                const active = form.visibility === vis.id;
                return (
                  <button
                    key={vis.id}
                    type="button"
                    onClick={() => patch({ visibility: vis.id })}
                    className={`w-full p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      active
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1">
                      <span
                        className={`font-semibold block text-xs md:text-sm ${active ? "text-primary" : "text-foreground"}`}
                      >
                        {vis.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {vis.desc}
                      </span>
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        active ? "border-primary" : "border-border"
                      }`}
                    >
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: author + toggles */}
        <div className="space-y-4">
          <div>
            <FieldLabel>Assign Active Author</FieldLabel>
            {availableAuthors.length === 0 ? (
              <p className="text-[11px] text-muted-foreground px-1">
                Loading members…
              </p>
            ) : (
              <div className="space-y-2">
                {availableAuthors.map((aut) => {
                  const selected = form.author === aut.id;
                  return (
                    <button
                      key={aut.id}
                      type="button"
                      onClick={() => patch({ author: aut.id })}
                      className={`w-full p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="flex-1 flex items-center gap-2">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${avatarColor(aut.id)}`}
                        >
                          {authorInitials(aut.name)}
                        </span>
                        <span className="flex-1 text-left">
                          <span className="text-xs md:text-sm font-semibold block text-foreground">
                            {aut.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {aut.role}
                          </span>
                        </span>
                      </span>
                      {selected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
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
          radius="lg"
          className="h-auto px-5 py-2.5 gap-1.5 text-xs font-bold active:scale-95"
          type="button"
          onClick={onPublish}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>
            {form.status === "published"
              ? "Confirm & Publish"
              : form.status === "scheduled"
                ? "Confirm & Schedule"
                : "Save as Draft"}
          </span>
        </Button>
      </div>
    </EditorCard>
  );
}
