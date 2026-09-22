"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  fieldColSpan,
  labelWeightClass,
  type FieldSection,
  type FormField,
} from "./forms.types";

interface TabsViewProps {
  sections: FieldSection[];
  /** Renders a single nested field's content (label + control, no col-span). */
  renderField: (field: FormField, index: number) => ReactNode;
  /** Font weight of the tab trigger text. */
  triggerWeight?: "bold" | "normal";
  /** Font weight of nested field labels. */
  labelWeight?: "bold" | "normal";
}

/**
 * A tab bar plus the active tab's fields, with a directional slide/fade on tab
 * change (framer-motion). Shares the {@link FieldSection} model with the
 * accordion and delegates nested field rendering via `renderField`.
 */
export function TabsView({
  sections,
  renderField,
  triggerWeight = "bold",
  labelWeight,
}: TabsViewProps) {
  const labelCls = labelWeightClass(labelWeight);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  // Clip horizontally only while the slide is in flight, so field dropdowns
  // (multi-select, autocomplete) aren't clipped when the tab is idle.
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), 450);
    return () => clearTimeout(t);
  }, [animating, active]);

  if (sections.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">This tabs block has no tabs.</p>
    );
  }

  const idx = Math.min(active, sections.length - 1);
  const current = sections[idx];

  const go = (i: number) => {
    if (i === idx) return;
    setDir(i > idx ? 1 : -1);
    setAnimating(true);
    setActive(i);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {sections.map((s, i) => {
          const on = i === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
                triggerWeight === "bold" ? "font-semibold" : "font-normal",
                on
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.title || `Tab ${i + 1}`}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div className={cn("relative pt-5", animating && "overflow-hidden")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: dir > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? -40 : 40 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn("grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-12", labelCls)}
          >
            {current.fields.map((f, i) => (
              <div key={f.id} className={cn("space-y-1.5", fieldColSpan(f.width))}>
                {renderField(f, i)}
              </div>
            ))}
            {current.fields.length === 0 && (
              <p className="col-span-full py-2 text-sm text-muted-foreground">
                No fields in this tab yet.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
