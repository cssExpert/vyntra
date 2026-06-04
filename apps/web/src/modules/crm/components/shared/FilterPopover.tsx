"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  subtitle?: string;
  isDynamic?: boolean;
  count?: number;
}

interface FilterPopoverProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
  width?: number;
}

// ─── Popover animation ───────────────────────────────────
const popoverVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.12 } },
};

function CheckboxRow({
  option,
  checked,
  onToggle,
}: {
  option: FilterOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: "hsl(var(--muted))" }}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer",
        checked && "bg-primary/5",
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border mt-0.5 transition-all duration-150",
          checked ? "border-primary bg-primary" : "border-border bg-background",
        )}
      >
        {checked && (
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        )}
      </div>

      {/* Icon */}
      {option.isDynamic && (
        <Zap className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
      )}

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            checked ? "text-primary" : "text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({option.count})
            </span>
          )}
        </p>
        {option.subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {option.subtitle}
          </p>
        )}
      </div>
    </motion.button>
  );
}

export function FilterPopover({
  label,
  options,
  selected,
  onChange,
  searchable = true,
  width = 360,
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus search on open
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [isOpen]);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  const activeCount = selected.length;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border bg-white dark:bg-muted",
          "transition-all duration-150 cursor-pointer",
          isOpen || activeCount > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-primary hover:bg-muted",
        )}
      >
        {label}
        {activeCount > 0 && (
          <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 min-w-4 text-center">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute left-0 top-full mt-2 z-50",
              "rounded-2xl border border-border bg-card shadow-glass-lg overflow-hidden",
            )}
            style={{
              width,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Arrow caret */}
            <div className="absolute -top-2 left-5 flex justify-center">
              <div className="h-4 w-4 rotate-45 border-l border-t border-border bg-card" />
            </div>

            {/* Search */}
            {searchable && (
              <div className="relative border-b border-border px-3 py-3">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className={cn(
                    "w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "outline-none focus:outline-none focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                />
              </div>
            )}

            {/* Options */}
            <div className="max-h-64 overflow-y-auto divide-y divide-border/50 no-scrollbar">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No results found
                </p>
              ) : (
                filtered.map((option) => (
                  <CheckboxRow
                    key={option.id}
                    option={option}
                    checked={selected.includes(option.id)}
                    onToggle={() => toggle(option.id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {selected.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
                <button
                  onClick={() => onChange([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
