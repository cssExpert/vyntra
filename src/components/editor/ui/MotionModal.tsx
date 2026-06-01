"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MotionModal — a reusable editor modal that keeps Radix Dialog for accessibility
 * (focus trap, Escape, outside-click dismissal, scroll lock, aria wiring) while
 * driving every enter/exit animation with Framer Motion via AnimatePresence.
 *
 * `forceMount` keeps the Radix subtree mounted so AnimatePresence can run exit
 * animations before React removes the nodes.
 */

const POPUP_SPRING: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.9,
};

interface MotionModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Classes for the dialog box (the centered popup). */
  className?: string;
  /** Classes for the backdrop overlay. */
  overlayClassName?: string;
  /** Forwarded to Radix Content — set to `undefined` (default) to silence the
   *  missing-description warning when the modal has no Description element. */
  ariaDescribedBy?: string;
}

export function MotionModal({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  ariaDescribedBy,
}: MotionModalProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                key="motion-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={cn(
                  "fixed inset-0 z-[200] bg-black/45 backdrop-blur-sm",
                  overlayClassName,
                )}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={ariaDescribedBy}
            >
              <motion.div
                key="motion-modal-content"
                initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-48%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.97, x: "-50%", y: "-48%" }}
                transition={POPUP_SPRING}
                className={cn(
                  "fixed top-1/2 left-1/2 z-[210] outline-none",
                  className,
                )}
              >
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

/** Radix a11y parts re-exported so consumers wire titles/close buttons correctly. */
export const MotionModalTitle = DialogPrimitive.Title;
export const MotionModalDescription = DialogPrimitive.Description;
export const MotionModalClose = DialogPrimitive.Close;
