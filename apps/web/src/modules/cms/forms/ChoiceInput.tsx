"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ChoiceStyle, FormField } from "./forms.types";

const customInputCls =
  "w-full h-[42px] rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";

/** Emoji satisfaction scale, low → high. */
export const EMOJI_SCALE = ["😡", "🙁", "😐", "🙂", "😍"];

/**
 * Renders option text with inline markdown-style links — `[label](url)` becomes
 * a real anchor (new tab). Links stop click propagation so they don't toggle the
 * checkbox. Used by the "terms" consent style.
 */
export function renderTextWithLinks(text: string): ReactNode {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push(
      <a
        key={key++}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {m[1]}
      </a>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

interface ChoiceInputProps {
  field: FormField;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  disabled?: boolean;
  error?: boolean;
}

function gridColsClass(n: number): string {
  if (n <= 1) return "sm:grid-cols-1";
  if (n === 2) return "sm:grid-cols-2";
  return "sm:grid-cols-3";
}

/** Small radio dot / checkbox indicator for card style. */
function Indicator({ multi, on }: { multi: boolean; on: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center border-2 transition-colors",
        multi ? "h-4 w-4 rounded-[5px]" : "h-4 w-4 rounded-full",
        on ? "border-primary" : "border-muted-foreground/40",
      )}
    >
      {on &&
        (multi ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary" fill="none">
            <path
              d="M2.5 6.2l2.2 2.3L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span className="h-2 w-2 rounded-full bg-primary" />
        ))}
    </span>
  );
}

/**
 * Renders a choice field (multiple_choice / checkboxes) in its configured style
 * — list, pills, segmented, or cards — plus the NPS (0–10) and emoji scales.
 * Fully interactive; shared by the published form and the builder preview.
 */
export function ChoiceInput({ field, value, onChange, disabled, error }: ChoiceInputProps) {
  const dim = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  // ── NPS 0–10 scale ──────────────────────────────────────────────────────
  if (field.type === "nps") {
    const selected = value as string;
    return (
      <div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 11 }).map((_, n) => {
            const on = selected === String(n);
            return (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => onChange(String(n))}
                className={cn(
                  "h-10 w-10 rounded-lg border text-sm font-semibold transition-colors",
                  on
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary/40",
                  dim,
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>Not likely</span>
          <span>Very likely</span>
        </div>
      </div>
    );
  }

  // ── Emoji scale ─────────────────────────────────────────────────────────
  if (field.type === "emoji") {
    const selected = value as string;
    return (
      <div className="flex items-center gap-2">
        {EMOJI_SCALE.map((emoji, i) => {
          const on = selected === String(i);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange(String(i))}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition-all",
                on
                  ? "border-primary bg-primary/10 scale-110"
                  : "border-border bg-background grayscale hover:grayscale-0 hover:border-primary/40",
                dim,
              )}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <ChoiceOptions
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
    />
  );
}

/**
 * The multiple_choice / checkboxes renderer. Split out so it can own the
 * `customActive` state for the optional free-text "custom" value input.
 */
function ChoiceOptions({ field, value, onChange, disabled, error }: ChoiceInputProps) {
  const multi = field.type === "checkboxes";
  const style: ChoiceStyle = field.choiceStyle ?? "list";
  const options = field.options;
  const dim = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  const errorRing = error ? "ring-1 ring-rose-500/40 rounded-lg" : "";

  // Custom free-text option (single-select only).
  const customOpt = !multi && field.allowCustom ? field.customOption || "Custom" : null;
  const [customActive, setCustomActive] = useState(
    () =>
      !!customOpt &&
      typeof value === "string" &&
      value !== "" &&
      !options.includes(value),
  );

  const selectedSet = multi
    ? new Set(Array.isArray(value) ? value : [])
    : new Set(typeof value === "string" && value ? [value] : []);

  const isOn = (opt: string) => {
    if (!multi && customActive) return opt === customOpt;
    return selectedSet.has(opt);
  };

  const select = (opt: string) => {
    if (disabled) return;
    if (multi) {
      const cur = Array.isArray(value) ? value : [];
      onChange(cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt]);
      return;
    }
    if (customOpt && opt === customOpt) {
      setCustomActive(true);
      onChange(""); // start with an empty custom value
    } else {
      setCustomActive(false);
      onChange(opt);
    }
  };

  let choices: ReactNode;
  if (style === "terms") {
    // Plain inline checkbox(es) — no box — for a consent / Terms statement.
    // The text is a span (not a button) so it can contain real links.
    choices = (
      <div className={cn("space-y-2", errorRing)}>
        {options.map((opt) => {
          const on = isOn(opt);
          return (
            <div key={opt} className="flex items-start gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                disabled={disabled}
                onClick={() => select(opt)}
                className={cn("mt-0.5 shrink-0", dim)}
              >
                <Indicator multi={multi} on={on} />
              </button>
              <span
                className={cn("text-sm text-foreground", dim)}
                onClick={() => !disabled && select(opt)}
              >
                {renderTextWithLinks(opt)}
              </span>
            </div>
          );
        })}
      </div>
    );
  } else if (style === "cards") {
    choices = (
      <div className={cn("grid grid-cols-1 gap-3", gridColsClass(options.length), errorRing)}>
        {options.map((opt, i) => {
          const on = isOn(opt);
          const detail = field.optionDetails?.[i];
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => select(opt)}
              className={cn(
                "rounded-xl border px-4 py-3.5 text-left transition-colors",
                on
                  ? "border-primary/70 bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-background hover:border-primary/40",
                dim,
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{opt}</span>
                <Indicator multi={multi} on={on} />
              </div>
              {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
            </button>
          );
        })}
      </div>
    );
  } else if (style === "pills") {
    choices = (
      <div className={cn("flex flex-wrap gap-2", errorRing)}>
        {options.map((opt) => {
          const on = isOn(opt);
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => select(opt)}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
                on
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-foreground hover:border-primary/40",
                dim,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  } else if (style === "segmented") {
    choices = (
      <div className={cn("inline-flex flex-wrap overflow-hidden rounded-lg border border-border", errorRing)}>
        {options.map((opt, i) => {
          const on = isOn(opt);
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => select(opt)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors",
                i > 0 && "border-l border-border",
                on ? "bg-primary text-white" : "bg-background text-foreground hover:bg-muted",
                dim,
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  } else {
    choices = (
      <div className={field.optionsLayout === "inline" ? "flex flex-wrap gap-2" : "space-y-2"}>
        {options.map((opt) => {
          const on = isOn(opt);
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => select(opt)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-primary/5",
                error && "border-rose-500/50",
                dim,
              )}
            >
              <Indicator multi={multi} on={on} />
              <span className="text-sm text-foreground">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {choices}
      {customActive && (
        <div className="mt-3">
          {field.customLabel && (
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {field.customLabel}
            </label>
          )}
          <input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.customPlaceholder || "Enter a value"}
            className={customInputCls}
          />
        </div>
      )}
    </div>
  );
}
