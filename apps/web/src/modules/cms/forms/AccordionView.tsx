"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fieldColSpan,
  labelWeightClass,
  type FieldSection,
  type FormField,
} from "./forms.types";

interface AccordionViewProps {
  sections: FieldSection[];
  /** Renders a single nested field's content (label + control, no col-span). */
  renderField: (field: FormField, index: number) => ReactNode;
  /** Allow several sections open at once (default: one at a time). */
  singleOpen?: boolean;
  /** Boxed cards (default) or flush FAQ-style rows with dividers. */
  style?: "boxed" | "flush";
  /** Font weight of the section trigger text. */
  triggerWeight?: "bold" | "normal";
  /** Font weight of nested field labels. */
  labelWeight?: "bold" | "normal";
}

/**
 * Collapsible sections that each hold a grid of nested fields. Rendering of the
 * nested fields is delegated via `renderField`, so the live form and the
 * builder preview share the exact same container while keeping their own field
 * renderers. Expand/collapse uses a browser-driven grid-rows transition — no
 * height measuring, no jerk, no border clipping.
 */
export function AccordionView({
  sections,
  renderField,
  singleOpen = true,
  style = "boxed",
  triggerWeight,
  labelWeight,
}: AccordionViewProps) {
  const flush = style === "flush";
  // Trigger weight falls back to each style's natural default.
  const trigW = triggerWeight ?? (flush ? "normal" : "bold");
  const labelCls = labelWeightClass(labelWeight);
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(sections[0] ? [sections[0].id] : []),
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      if (singleOpen) return prev.has(id) ? new Set() : new Set([id]);
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={flush ? "border-t border-border" : "space-y-3"}>
      {sections.map((section) => {
        const isOpen = open.has(section.id);
        return (
          <div
            key={section.id}
            className={
              flush
                ? "border-b border-border"
                : "overflow-hidden rounded-xl border border-border"
            }
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 text-left transition-colors",
                flush ? "py-4" : "bg-muted/40 px-4 py-3 hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "text-foreground",
                  flush ? "text-base" : "text-sm",
                  trigW === "bold" ? "font-semibold" : "font-normal",
                )}
              >
                {section.title || "Section"}
              </span>
              {flush ? (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ChevronDown
                    size={18}
                    className={cn("transition-transform duration-300", isOpen && "rotate-180")}
                  />
                </span>
              ) : (
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isOpen
                  ? "visible grid-rows-[1fr] opacity-100"
                  : "invisible grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-12",
                    flush ? "pb-5" : "p-4",
                    labelCls,
                  )}
                >
                  {section.fields.map((f, i) => (
                    <div key={f.id} className={cn("space-y-1.5", fieldColSpan(f.width))}>
                      {renderField(f, i)}
                    </div>
                  ))}
                  {section.fields.length === 0 && (
                    <p className="col-span-full py-2 text-sm text-muted-foreground">
                      No fields in this section yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {sections.length === 0 && (
        <p className="py-2 text-sm text-muted-foreground">
          This accordion has no sections.
        </p>
      )}
    </div>
  );
}
