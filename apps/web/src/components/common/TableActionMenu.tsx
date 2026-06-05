"use client";

import React, { useState } from "react";
import { Popover } from "react-tiny-popover";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

// ─── Animation variants (mirrors ProfileMenu style) ──────────────────────────

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.13, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: "easeIn" } },
};

const panelVariants = {
  hidden: { scale: 0.93, y: -6 },
  visible: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.04,
      delayChildren: 0.04,
    },
  },
  exit: {
    scale: 0.93,
    y: -6,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.14, ease: "easeOut" },
  },
};

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
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TableActionMenu({
  items,
  align = "end",
  boundaryElement,
  parentElement,
  boundaryInset = 8,
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
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
              className="w-44 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
            >
              <motion.div
                variants={panelVariants}
                className="rounded-xl overflow-hidden border border-border bg-card flex flex-col origin-top-right"
              >
                <div className="py-1">
                  {items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {item.separator && (
                        <div className="my-1 mx-2 border-t border-border" />
                      )}
                      <motion.button
                        variants={itemVariants}
                        type="button"
                        onClick={() => {
                          item.onClick();
                          close();
                        }}
                        className={`group flex items-center gap-1 px-3 py-2 mx-1 rounded-sm text-sm font-medium transition-all duration-150 cursor-pointer w-[calc(100%-8px)] ${
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
                      </motion.button>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
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
        className={`p-1.5 rounded-md transition-all ${
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
