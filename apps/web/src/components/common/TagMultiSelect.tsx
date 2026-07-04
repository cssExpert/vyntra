"use client";

import { useEffect, useRef, useState } from "react";
import { Tag as TagIcon, Plus, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TagMultiSelectProps {
  /** Currently selected tag names. */
  value: string[];
  onChange: (tags: string[]) => void;
  /** Org tag catalog — used for autocomplete + quick-select pills. */
  availableTags: string[];
  /** Called when the user picks a name that isn't in `availableTags` yet — should findOrCreate it in the shared tag catalog. */
  onCreateTag: (name: string) => Promise<void>;
  maxTags?: number;
  placeholder?: string;
  onToast?: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
  className?: string;
}

/**
 * Multi-select tag picker backed by the shared, org-scoped tag catalog
 * (search existing tags, or create a new one on the fly). Used anywhere
 * tags are assigned — blogs, products, and future taggable entities.
 */
export function TagMultiSelect({
  value,
  onChange,
  availableTags,
  onCreateTag,
  maxTags = 20,
  placeholder,
  onToast,
  className,
}: TagMultiSelectProps) {
  const [tagSearch, setTagSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const atLimit = value.length >= maxTags;
  const cleanSearch = tagSearch.trim().replace(/[^a-zA-Z0-9\s\-_]/g, "");

  const filtered = availableTags.filter(
    (t) => !value.includes(t) && t.toLowerCase().includes(cleanSearch.toLowerCase()),
  );

  const exactMatch = availableTags.some((t) => t.toLowerCase() === cleanSearch.toLowerCase());
  const canCreate = cleanSearch.length > 0 && !exactMatch;

  const addTag = async (name: string) => {
    if (atLimit) {
      onToast?.(`Limit of ${maxTags} tags reached`, "warning");
      return;
    }
    if (value.includes(name)) return;

    const isNew = !availableTags.some((t) => t.toLowerCase() === name.toLowerCase());

    onChange([...value, name]);
    setTagSearch("");
    setShowDropdown(false);

    if (isNew) {
      setCreating(true);
      await onCreateTag(name);
      setCreating(false);
    }
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && cleanSearch) {
      e.preventDefault();
      const match = availableTags.find((t) => t.toLowerCase() === cleanSearch.toLowerCase());
      addTag(match ?? cleanSearch);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      setTagSearch("");
    }
  };

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
    <div className={cn("space-y-2", className)}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((t) => (
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

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={tagSearch}
            onChange={(e) => {
              setTagSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={atLimit ? `Tag limit reached` : (placeholder ?? "Search or create a tag…")}
            disabled={atLimit}
            className="!pl-9 text-xs disabled:opacity-50"
          />
          {creating && (
            <span className="absolute right-3 text-[9px] text-muted-foreground font-bold animate-pulse">
              saving…
            </span>
          )}
        </div>

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
                <TagIcon className="w-3 h-3 text-muted-foreground shrink-0" />
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
                className="group w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-primary/5 transition-colors border-t border-border text-primary font-semibold"
              >
                <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4 shrink-0" />
                <span>Create &ldquo;#{cleanSearch}&rdquo;</span>
              </button>
            )}
          </div>
        )}
      </div>

      {availableTags.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            Available
          </p>
          <div className="flex flex-wrap gap-1">
            {availableTags
              .filter((t) => !value.includes(t))
              .slice(0, 16)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={atLimit}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>#{tag}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
