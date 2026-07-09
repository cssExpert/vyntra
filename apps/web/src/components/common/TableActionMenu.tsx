"use client";

import React, { useState } from "react";
import { Popover } from "react-tiny-popover";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converts a Tailwind `w-{n}` class or a CSS string/number to a CSS width value. */
function resolveWidth(value?: string | number): string | number {
  if (value === undefined) return 176; // default w-44
  if (typeof value === "number") return value;
  const tw = value.match(/^w-(\d+(?:\.\d+)?)$/);
  if (tw) return parseFloat(tw[1]) * 4; // Tailwind: 1 unit = 4px
  return value; // plain CSS value e.g. "300px", "14rem"
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  separator?: boolean; // renders a divider above this item
}

export interface TableActionMenuProps {
  items: TableActionItem[];
  align?: "start" | "center" | "end";
  /** Keeps the menu positioned inside this element (e.g. table card container). */
  boundaryElement?: HTMLElement | null;
  /** Portal target; defaults to `boundaryElement` when set. */
  parentElement?: HTMLElement | null;
  boundaryInset?: number;
  /** Dropdown width — Tailwind shorthand (e.g. "w-80"), CSS string (e.g. "300px", "14rem"), or pixel number (e.g. 220). Defaults to 176 (w-44). */
  dropdownWidth?: string | number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TableActionMenu({
  items,
  align = "end",
  boundaryElement,
  parentElement,
  boundaryInset = 8,
  dropdownWidth,
}: TableActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);
  const bounded = boundaryElement != null;

  return (
    <Popover
      isOpen={isOpen}
      positions={["bottom", "top"]}
      align={align}
      padding={6}
      reposition
      onClickOutside={close}
      containerStyle={{ zIndex: "9999" }}
      {...(bounded
        ? {
            boundaryElement,
            parentElement: parentElement ?? boundaryElement,
            boundaryInset,
          }
        : {})}
      content={
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: resolveWidth(dropdownWidth),
                transformOrigin: "top right",
              }}
              className="rounded-xl overflow-hidden border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
            >
              <div className="py-1">
                {items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {item.separator && (
                      <div className="my-1 mx-2 border-t border-border" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        item.onClick();
                        close();
                      }}
                      className={`group flex items-center text-start gap-1 px-3 py-2 mx-1 rounded-sm text-sm font-medium transition-all duration-150 cursor-pointer w-[calc(100%-8px)] ${
                        item.variant === "danger"
                          ? "text-rose-600 hover:bg-rose-500/10"
                          : "text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition-colors duration-150 ${
                          item.variant === "danger"
                            ? " text-rose-500"
                            : "text-muted-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`p-1.5 rounded-md transition-all text-start ${
          isOpen
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <MoreHorizontal size={16} />
      </button>
    </Popover>
  );
}
