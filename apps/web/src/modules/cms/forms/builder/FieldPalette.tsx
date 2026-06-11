"use client";

import { motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";

import { FIELD_TYPES, renderFieldIcon } from "./field-config";
import type { FieldType } from "../forms.types";

interface FieldPaletteProps {
  onAdd: (type: FieldType) => void;
}

export function FieldPalette({ onAdd }: FieldPaletteProps) {
  return (
    <aside className="bg-card border border-border rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sticky top-4 self-start">
      <p className="text-sm md:text-base font-semibold text-foreground mb-1">
        Add a field
      </p>
      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
        <MousePointerClick className="w-3 h-3" />
        Click to add to your form
      </p>

      <div className="grid grid-cols-1 gap-1.5">
        {FIELD_TYPES.map((meta, i) => {
          return (
            <motion.button
              key={meta.type}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAdd(meta.type)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-colors group cursor-pointer"
            >
              <span className="w-7 h-7 rounded-md bg-muted group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                {renderFieldIcon(
                  meta.icon,
                  "w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors",
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm md:text-md font-semibold text-foreground leading-tight">
                  {meta.label}
                </span>
                <span className="block text-xs text-muted-foreground truncate">
                  {meta.hint}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
