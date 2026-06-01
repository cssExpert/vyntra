"use client";

import React from "react";

// Shared field primitives — themed once, reused across every editor tab.

export const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all";

export const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2";

export function FieldLabel({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <label className={`${labelClass} flex items-center justify-between`}>
      <span>{children}</span>
      {right}
    </label>
  );
}

export function EditorCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-6 rounded-2xl border border-border bg-card shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-muted rounded-lg p-0.5 border border-border">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-2.5 py-1 text-[11px] rounded-md font-bold capitalize transition-all flex items-center gap-1 ${
            value === opt.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
