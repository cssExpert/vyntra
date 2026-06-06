"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollapseItem {
  id: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface CollapseProps {
  items: CollapseItem[];
  /** Allow multiple panels open simultaneously. Default: false (accordion mode). */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
  itemClassName?: string;
  /** Custom chevron area; defaults to animated ChevronDown */
  hideChevron?: boolean;
}

export function Collapse({
  items,
  multiple = false,
  defaultOpen = [],
  className,
  itemClassName,
  hideChevron = false,
}: CollapseProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border border-border overflow-hidden transition-shadow",
              isOpen && "shadow-sm",
              item.disabled && "opacity-50 pointer-events-none",
              itemClassName,
            )}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full px-5 py-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 text-left"
            >
              <div className="flex-1 min-w-0">{item.trigger}</div>
              {!hideChevron && (
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="border-t border-border">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
