"use client";

import React, { useState } from "react";
import { Popover } from "react-tiny-popover";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

export interface FilterPanelProps {
  /** The button/trigger element that opens the panel */
  trigger: React.ReactNode;
  title?: string;
  onSearch: () => void;
  onClear: () => void;
  /** Shows an active indicator dot on the trigger when true */
  hasActiveFilters?: boolean;
  children: React.ReactNode;
}

export function FilterPanel({
  trigger,
  title = "Choose Filters",
  onSearch,
  onClear,
  hasActiveFilters = false,
  children,
}: FilterPanelProps) {
  // Two states so Framer Motion can animate BOTH directions:
  // `popoverMounted` keeps react-tiny-popover rendering the content (so the
  // exit animation has something to run on), while `contentVisible` drives
  // AnimatePresence. On close we hide the content first, then unmount the
  // popover only after the exit animation completes.
  const [popoverMounted, setPopoverMounted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const open = () => {
    setPopoverMounted(true);
    setContentVisible(true);
  };
  const close = () => setContentVisible(false);
  const toggle = () => (contentVisible ? close() : open());

  return (
    <Popover
      isOpen={popoverMounted}
      positions={["bottom", "top"]}
      align="end"
      padding={8}
      onClickOutside={close}
      containerStyle={{ zIndex: "9999" }}
      content={
        <AnimatePresence onExitComplete={() => setPopoverMounted(false)}>
          {contentVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
                mass: 0.8,
              }}
              style={{ transformOrigin: "top right" }}
              className="w-[400px] glass-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.18 }}
                className="flex items-center justify-between px-5 py-4 border-b border-border"
              >
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <button
                  type="button"
                  onClick={close}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>

              {/* Body */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.2 }}
                className="px-5 py-5 space-y-5"
              >
                {children}
              </motion.div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onSearch();
                    close();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-primary-foreground rounded-sm text-sm font-semibold transition-all active:scale-95"
                >
                  <Search size={15} />
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    close();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/70 text-foreground rounded-sm text-sm font-semibold transition-all active:scale-95 border border-border"
                >
                  <X size={15} />
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      {/* Wrap trigger in a relative container so the active dot can position correctly */}
      <div className="relative inline-flex" onClick={toggle}>
        {trigger}
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-background" />
        )}
      </div>
    </Popover>
  );
}
