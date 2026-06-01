"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { COMPONENT_BLOCKS, CATEGORIES } from "@/lib/componentBlocks";
import type { ComponentBlock } from "@/types/editor";
import { cn } from "@/lib/utils";

// ─── Mini block preview ───────────────────────────────────────────────────────

function BlockPreview({ category }: { category: string }) {
  switch (category) {
    case "Hero":
      return (
        <div className="w-full h-full bg-linear-to-br from-muted to-primary flex flex-col items-center justify-center gap-1.5 p-3">
          <div className="h-2 w-1/2 rounded bg-card/60" />
          <div className="h-1.5 w-2/3 rounded bg-card/35" />
          <div className="h-1 w-5/6 rounded bg-card/20" />
          <div className="h-4 w-1/3 rounded-full bg-card/80 mt-1" />
        </div>
      );
    case "Navbar":
      return (
        <div className="w-full h-full bg-card flex items-center px-3 justify-between border-b border-border">
          <div className="h-2 w-1/5 rounded bg-foreground" />
          <div className="flex gap-1.5 items-center">
            <div className="h-1 w-5 rounded bg-muted" />
            <div className="h-1 w-5 rounded bg-muted" />
            <div className="h-1 w-5 rounded bg-muted" />
            <div className="h-4 w-10 rounded-md bg-blue-600" />
          </div>
        </div>
      );
    case "Features":
      return (
        <div className="w-full h-full bg-muted flex gap-1.5 p-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-lg bg-card border border-border flex flex-col gap-1 p-1.5"
            >
              <div className="w-4 h-4 rounded-md bg-primary/10" />
              <div className="h-1.5 w-3/4 rounded bg-muted" />
              <div className="h-1 w-full rounded bg-muted" />
              <div className="h-1 w-5/6 rounded bg-muted" />
            </div>
          ))}
        </div>
      );
    case "Pricing":
      return (
        <div className="w-full h-full bg-card flex gap-1.5 p-2 items-stretch">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-lg p-1.5 flex flex-col gap-1",
                i === 1 ? "bg-primary" : "bg-muted border border-border",
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-2/3 rounded",
                  i === 1 ? "bg-card/60" : "bg-muted",
                )}
              />
              <div
                className={cn(
                  "h-2.5 w-1/2 rounded",
                  i === 1 ? "bg-card/80" : "bg-muted",
                )}
              />
              <div className="flex flex-col gap-0.5 mt-0.5">
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className={cn(
                      "h-1 rounded",
                      i === 1 ? "bg-card/30" : "bg-muted",
                    )}
                    style={{ width: `${75 - j * 15}%` }}
                  />
                ))}
              </div>
              <div
                className={cn(
                  "h-4 rounded-md mt-auto",
                  i === 1 ? "bg-card" : "bg-primary",
                )}
              />
            </div>
          ))}
        </div>
      );
    case "Testimonials":
      return (
        <div className="w-full h-full bg-muted flex gap-1.5 p-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-lg bg-card border border-border p-1.5 flex flex-col gap-1"
            >
              <div className="h-1 w-full rounded bg-muted" />
              <div className="h-1 w-3/4 rounded bg-muted" />
              <div className="h-1 w-5/6 rounded bg-muted" />
              <div className="flex items-center gap-1 mt-auto pt-1">
                <div className="w-3 h-3 rounded-full bg-linear-to-br from-primary to-violet-400" />
                <div className="h-1 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      );
    case "FAQ":
      return (
        <div className="w-full h-full bg-card flex flex-col gap-1 p-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded bg-muted border border-border px-2 py-1 flex items-center justify-between gap-2"
            >
              <div
                className="h-1 rounded bg-muted flex-1"
                style={{ width: `${80 - i * 10}%` }}
              />
              <span className="text-muted-foreground text-[10px] font-light leading-none">
                +
              </span>
            </div>
          ))}
        </div>
      );
    case "Team":
      return (
        <div className="w-full h-full bg-card flex gap-2 items-center justify-center p-2">
          {[
            "from-blue-300 to-purple-400",
            "from-rose-300 to-pink-400",
            "from-emerald-300 to-teal-400",
            "from-amber-300 to-orange-400",
          ].map((g, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-5 h-5 rounded-full bg-linear-to-br ${g}`} />
              <div className="h-1 w-6 rounded bg-muted" />
            </div>
          ))}
        </div>
      );
    case "Footer":
      return (
        <div className="w-full h-full bg-foreground flex gap-2 p-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex flex-col gap-0.5">
              <div className="h-1.5 w-3/4 rounded bg-card/30 mb-0.5" />
              <div className="h-1 w-full rounded bg-card/12" />
              <div className="h-1 w-2/3 rounded bg-card/12" />
              <div className="h-1 w-3/4 rounded bg-card/12" />
            </div>
          ))}
        </div>
      );
    case "Portfolio":
      return (
        <div className="w-full h-full bg-card flex flex-col gap-1 p-1.5">
          <div className="h-1.5 w-1/4 rounded bg-muted self-center mb-0.5" />
          <div className="flex-1 grid grid-cols-3 gap-0.5">
            {[
              "from-blue-300 to-cyan-300",
              "from-violet-300 to-pink-300",
              "from-orange-300 to-amber-300",
              "from-green-300 to-teal-300",
              "from-rose-300 to-red-300",
              "from-primary to-blue-300",
            ].map((g, i) => (
              <div key={i} className={`rounded bg-linear-to-br ${g}`} />
            ))}
          </div>
        </div>
      );
    case "Cards":
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center p-2">
          <div className="w-4/5 rounded-xl bg-card border border-border overflow-hidden shadow-sm">
            <div className="h-7 bg-linear-to-r from-blue-400 to-primary" />
            <div className="p-1.5 flex flex-col gap-0.5">
              <div className="h-1.5 w-2/3 rounded bg-muted" />
              <div className="h-1 w-full rounded bg-muted" />
              <div className="h-1 w-1/3 rounded bg-blue-200" />
            </div>
          </div>
        </div>
      );
    case "Typography":
      return (
        <div className="w-full h-full bg-card flex flex-col justify-center gap-1.5 p-3">
          <div className="h-3.5 w-3/4 rounded bg-foreground" />
          <div className="h-2 w-1/2 rounded bg-muted" />
          <div className="h-1 w-full rounded bg-muted" />
          <div className="h-1 w-5/6 rounded bg-muted" />
          <div className="h-1 w-4/5 rounded bg-muted" />
        </div>
      );
    case "Buttons":
      return (
        <div className="w-full h-full bg-card flex flex-wrap gap-1.5 items-center justify-center p-2">
          <div className="h-5 w-14 rounded-lg bg-blue-600" />
          <div className="h-5 w-14 rounded-lg border-2 border-border" />
          <div className="h-5 w-14 rounded-lg bg-muted" />
        </div>
      );
    case "Containers":
      return (
        <div className="w-full h-full bg-muted flex flex-col gap-1 p-2">
          <div className="flex gap-1 h-1/2">
            <div className="flex-1 rounded-md bg-muted" />
            <div className="flex-1 rounded-md bg-muted" />
          </div>
          <div className="flex gap-1 h-1/2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-md bg-muted" />
            ))}
          </div>
        </div>
      );
    case "Images":
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center p-2">
          <div className="w-4/5 aspect-video rounded-lg bg-linear-to-br from-muted to-muted flex items-center justify-center">
            <div className="w-6 h-6 rounded-md bg-muted/40" />
          </div>
        </div>
      );
    case "Forms":
      return (
        <div className="w-full h-full bg-card flex flex-col gap-1.5 p-2.5">
          <div className="h-4 w-full rounded-md border border-border bg-muted" />
          <div className="h-4 w-full rounded-md border border-border bg-muted" />
          <div className="h-7 w-full rounded-md border border-border bg-muted" />
          <div className="h-5 w-full rounded-md bg-blue-600" />
        </div>
      );
    case "Contact":
      return (
        <div className="w-full h-full bg-muted flex flex-col gap-1.5 p-2.5">
          <div className="h-1.5 w-1/3 rounded bg-muted self-center" />
          <div className="flex gap-1">
            <div className="h-4 flex-1 rounded border border-border bg-card" />
            <div className="h-4 flex-1 rounded border border-border bg-card" />
          </div>
          <div className="h-4 w-full rounded border border-border bg-card" />
          <div className="h-5 w-full rounded-md bg-blue-600" />
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-linear-to-br from-muted to-muted flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-muted" />
        </div>
      );
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BlockPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (block: ComponentBlock) => void;
}

export default function BlockPickerModal({
  open,
  onClose,
  onSelect,
}: BlockPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // isSearching is derived — true during the debounce window, never stored in state
  const isSearching = search !== debouncedSearch;

  // Only depends on `search`; debouncedSearch is the lagging mirror
  useEffect(() => {
    if (!search.trim()) {
      // setDebouncedSearch(search);
      return;
    }
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function clearSearch() {
    setSearch("");
    setDebouncedSearch(""); // sync immediately so isSearching stays false
  }

  const allCategories = ["All", ...CATEGORIES];

  const visible = COMPONENT_BLOCKS.filter((b) => {
    const matchCat = activeCategory === "All" || b.category === activeCategory;
    const matchSearch =
      !debouncedSearch.trim() ||
      b.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleSelect(block: ComponentBlock) {
    onSelect(block);
    onClose();
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose();
      clearSearch();
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-150 bg-black/40 backdrop-blur-sm
            data-open:animate-in data-open:fade-in-0
            data-closed:animate-out data-closed:fade-out-0 duration-150"
        />
        <DialogPrimitive.Popup
          className="fixed top-1/2 left-1/2 z-250 -translate-x-1/2 -translate-y-1/2
            w-[calc(100vw-2rem)] max-w-4xl max-h-[calc(100vh-4rem)]
            flex flex-col bg-card
            rounded-2xl shadow-2xl outline-none overflow-hidden
            data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
            data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95
            duration-150"
        >
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-border dark:border-white/8 shrink-0">
            <DialogPrimitive.Title className="text-base font-semibold text-foreground dark:text-white shrink-0">
              Add Block
            </DialogPrimitive.Title>

            {/* Search */}
            <div className="relative flex-1">
              {/* Left icon: spinner while debouncing, magnifier otherwise */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary dark:text-primary animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>

              <input
                type="text"
                placeholder="Search blocks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 py-1.5 rounded-lg text-sm
                  bg-muted dark:bg-card/8
                  text-foreground dark:text-white
                  placeholder:text-muted-foreground dark:placeholder:text-muted-foreground
                  border border-transparent focus:border-primary dark:focus:border-primary/50
                  focus:outline-none transition-colors"
                style={{ paddingRight: search ? "2rem" : "0.75rem" }}
              />

              {/* Clear button — only when there's text */}
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2
                    w-5 h-5 rounded-full flex items-center justify-center
                    bg-muted dark:bg-card/15
                    text-muted-foreground dark:text-muted-foreground
                    hover:bg-muted dark:hover:bg-card/25
                    transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <DialogPrimitive.Close
              className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted
                dark:text-muted-foreground dark:hover:text-muted-foreground dark:hover:bg-card/8 transition-colors shrink-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            {/* Category sidebar */}
            <aside className="w-44 shrink-0 border-r border-border dark:border-white/8 p-3 flex flex-col gap-0.5 overflow-y-auto">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
                    activeCategory === cat
                      ? "bg-muted dark:bg-card/10 text-foreground dark:text-white font-medium"
                      : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-card/6",
                  )}
                >
                  {cat}
                </button>
              ))}
            </aside>

            {/* Block grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-6 h-6 text-primary dark:text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Searching…
                  </p>
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    No blocks found
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    Try a different keyword or{" "}
                    <button
                      onClick={clearSearch}
                      className="underline underline-offset-2 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      clear the search
                    </button>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {visible.map((block) => (
                    <button
                      key={block.id}
                      onClick={() => handleSelect(block)}
                      className="group flex flex-col rounded-xl overflow-hidden border border-border dark:border-white/8
                        hover:border-primary dark:hover:border-primary/50
                        hover:shadow-md dark:hover:shadow-black/20
                        focus:outline-none focus-visible:border-primary
                        transition-all duration-150 bg-card dark:bg-muted"
                    >
                      {/* Preview */}
                      <div className="h-24 w-full overflow-hidden shrink-0 bg-muted dark:bg-card">
                        <BlockPreview category={block.category} />
                      </div>

                      {/* Label */}
                      <div className="px-3 py-2.5 text-left">
                        <p className="text-xs font-semibold text-foreground dark:text-white leading-tight truncate">
                          {block.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground dark:text-muted-foreground mt-0.5 truncate">
                          {block.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
