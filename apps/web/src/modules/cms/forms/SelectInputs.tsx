"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const triggerBase =
  "w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

const menuBase =
  "absolute z-20 w-full max-h-56 overflow-auto rounded-lg border border-border bg-card pb-1 shadow-lg";

/** Estimated menu height used to decide whether to open upward. */
const MENU_ESTIMATE = 240;

/** Max selected chips shown before collapsing the rest into a "+N" badge. */
const MAX_CHIPS = 5;

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

/**
 * Decides whether the menu should open upward: flip only when there isn't room
 * below the control and there's more space above. Returns the position class.
 */
function dropDirection(el: HTMLElement | null): "top-full mt-1" | "bottom-full mb-1" {
  if (!el) return "top-full mt-1";
  const r = el.getBoundingClientRect();
  const below = window.innerHeight - r.bottom;
  return below < MENU_ESTIMATE && r.top > below ? "bottom-full mb-1" : "top-full mt-1";
}

// ── Multi-select ─────────────────────────────────────────────────────────────

export interface MultiSelectInputProps {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

/** A dropdown that allows selecting several options, shown as removable chips. */
export function MultiSelectInput({
  options,
  value,
  onChange,
  placeholder = "Select options…",
  disabled,
  error,
}: MultiSelectInputProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<string>("top-full mt-1");
  const [query, setQuery] = useState("");
  const ref = useOutsideClose(() => {
    setOpen(false);
    setQuery("");
  });
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((v) => v !== opt)
        : [...selected, opt],
    );

  // Options still available to pick — selected ones move to chips, and the
  // search query narrows the list.
  const available = options.filter(
    (o) => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!open) setPos(dropDirection(ref.current));
          setOpen((o) => !o);
        }}
        className={cn(
          triggerBase,
          "flex min-h-[42px] items-center justify-between gap-2 py-1.5",
          error && "border-rose-500",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <span className="flex flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-muted-foreground/60">{placeholder}</span>
          ) : (
            <>
              {selected.slice(0, MAX_CHIPS).map((opt) => (
                <span
                  key={opt}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {opt}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-primary/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled) toggle(opt);
                    }}
                  />
                </span>
              ))}
              {selected.length > MAX_CHIPS && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +{selected.length - MAX_CHIPS}
                </span>
              )}
            </>
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className={cn(menuBase, pos)}>
          <div className="sticky top-0 bg-card p-1.5">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
            />
          </div>
          {available.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                toggle(opt);
                setQuery("");
              }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              {opt}
            </button>
          ))}
          {available.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {query ? "No matches" : "All options selected"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Autocomplete ─────────────────────────────────────────────────────────────

export interface AutocompleteInputProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

/** A text input that filters and suggests options as you type. */
export function AutocompleteInput({
  options,
  value,
  onChange,
  placeholder = "Type to search…",
  disabled,
  error,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<string>("top-full mt-1");
  const ref = useOutsideClose(() => setOpen(false));
  const query = typeof value === "string" ? value : "";
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setPos(dropDirection(ref.current));
          setOpen(true);
        }}
        className={cn(
          triggerBase,
          "h-[42px] placeholder:text-muted-foreground/60",
          error && "border-rose-500",
          disabled && "cursor-not-allowed opacity-50",
        )}
      />
      {open && filtered.length > 0 && (
        <div className={cn(menuBase, pos)}>
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
