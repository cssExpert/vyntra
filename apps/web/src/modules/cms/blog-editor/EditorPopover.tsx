"use client";

import React, { useState } from "react";
import { Popover } from "react-tiny-popover";
import { motion, AnimatePresence } from "framer-motion";

export function EditorPopover({
  trigger,
  children,
  width = 200,
}: {
  trigger: (open: boolean) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  width?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <Popover
      isOpen={isOpen}
      positions={["bottom", "top"]}
      align="start"
      padding={6}
      onClickOutside={close}
      containerStyle={{ zIndex: "9999" }}
      content={
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ width }}
              className="rounded-xl border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.16)] p-2"
            >
              {children(close)}
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      <div onClick={() => setIsOpen((p) => !p)} className="inline-flex">
        {trigger(isOpen)}
      </div>
    </Popover>
  );
}
