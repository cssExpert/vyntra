"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { MousePointerClick, ChevronDown } from "lucide-react";

import {
  FIELD_TYPES,
  FIELD_CATEGORY_ORDER,
  renderFieldIcon,
  type FieldCategory,
  type FieldTypeMeta,
} from "./field-config";
import { SearchInput } from "@/components/common/SearchInput";
import type { FieldType } from "../forms.types";

interface FieldPaletteProps {
  onAdd: (type: FieldType) => void;
  footer?: ReactNode;
}

// Slim, themed scrollbar (webkit + firefox) — a custom look without the
// layout issues the overlay-scrollbar plugin hit inside this flex column.
const scrollbarClass =
  "[scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50";

export function FieldPalette({ onAdd, footer }: FieldPaletteProps) {
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<FieldType | null>(null);

  // Group the field types by category (filtered by the search query),
  // preserving the configured order and dropping empty groups.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (m: FieldTypeMeta) =>
      !q || `${m.label} ${m.hint}`.toLowerCase().includes(q);
    const byCategory = new Map<FieldCategory, FieldTypeMeta[]>();
    for (const meta of FIELD_TYPES) {
      if (!match(meta)) continue;
      const list = byCategory.get(meta.category) ?? [];
      list.push(meta);
      byCategory.set(meta.category, list);
    }
    return FIELD_CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
      category: c,
      items: byCategory.get(c)!,
    }));
  }, [query]);

  const searching = query.trim().length > 0;

  // All categories start expanded.
  const [collapsed, setCollapsed] = useState<Set<FieldCategory>>(new Set());
  const toggle = (c: FieldCategory) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  return (
    <aside className="bg-card border border-border rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sticky top-4 self-start flex flex-col max-h-[calc(100vh-9rem)] overflow-hidden">
      {/* Header — fixed */}
      <div className="shrink-0">
        <p className="text-sm md:text-base font-semibold text-foreground mb-1">
          Add a field
        </p>
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <MousePointerClick className="w-3 h-3" />
          Click to add to your form
        </p>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search fields…"
          size="sm"
          className="mb-3"
        />
      </div>

      {/* Field list — bounded flex slot so it scrolls within the fixed height
          and the footer (reCAPTCHA) stays above the fold. */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto -mr-2 pr-2 ${scrollbarClass}`}
      >
        <div className="space-y-3" onMouseLeave={() => setHovered(null)}>
          {groups.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No fields match “{query}”.
            </p>
          )}
          {groups.map(({ category, items }) => {
            const isCollapsed = !searching && collapsed.has(category);
            return (
              <div key={category}>
                <button
                  type="button"
                  onClick={() => toggle(category)}
                  className="flex w-full items-center justify-between px-1 py-1 group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {category}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground/60 transition-transform ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="grid grid-cols-1 gap-1.5 px-0.5 pt-1.5 pb-1"
                  >
                    {items.map((meta) => (
                      <motion.button
                        key={meta.type}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={() => setHovered(meta.type)}
                        onClick={() => onAdd(meta.type)}
                        className="group relative flex items-center gap-2.5 w-full px-1.5 py-1 rounded-lg text-left cursor-pointer"
                      >
                        {hovered === meta.type && (
                          <motion.span
                            layoutId="paletteHover"
                            aria-hidden
                            className="absolute inset-0 rounded-lg border border-primary/25 bg-primary/[0.07]"
                            transition={{ type: "spring", stiffness: 600, damping: 42 }}
                          />
                        )}
                        <span className="relative z-10 w-7 h-7 rounded-md bg-muted group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                          {renderFieldIcon(
                            meta.icon,
                            "w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors",
                          )}
                        </span>
                        <span className="relative z-10 min-w-0">
                          <span className="block text-sm font-semibold text-foreground leading-tight">
                            {meta.label}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {meta.hint}
                          </span>
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer (Form Settings / reCAPTCHA) — always visible */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-border shrink-0">{footer}</div>
      )}
    </aside>
  );
}
