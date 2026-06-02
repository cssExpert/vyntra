"use client";

import React, { useState } from "react";
import { inputClass } from "./fields";

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  onLimit?: () => void;
}

export function TagInput({ tags, onChange, max = 8, onLimit }: TagInputProps) {
  const [value, setValue] = useState("");

  const add = () => {
    const clean = value.trim().replace(/[^a-zA-Z0-9\s]/g, "");
    if (!clean || tags.includes(clean)) return;
    if (tags.length >= max) {
      onLimit?.();
      return;
    }
    onChange([...tags, clean]);
    setValue("");
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Press Enter to add a tag…"
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2.5 bg-muted hover:bg-muted/70 text-foreground text-xs font-bold rounded-lg border border-border transition-all shrink-0"
        >
          Add
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
            >
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => remove(t)}
                className="font-extrabold hover:text-rose-500 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
