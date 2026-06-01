"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MotionDropdownContent — Radix DropdownMenu content with Framer Motion enter/exit.
 *
 * Radix positions the floating element via its own transform, so the animated
 * `motion.div` is nested *inside* Content (rather than `asChild`) to avoid two
 * transforms fighting. `forceMount` keeps Content mounted while AnimatePresence
 * plays the exit animation. The panel scales from the Radix-provided origin so it
 * grows out of the trigger corner.
 *
 * Drive `open` with the same state used by the controlled `DropdownMenu.Root`.
 */

interface MotionDropdownContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  open: boolean;
}

export const MotionDropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  MotionDropdownContentProps
>(({ open, className, children, sideOffset = 6, ...props }, ref) => (
  <AnimatePresence>
    {open && (
      <DropdownMenuPrimitive.Portal forceMount>
        <DropdownMenuPrimitive.Content
          ref={ref}
          forceMount
          sideOffset={sideOffset}
          className="z-50 outline-none"
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin:
                "var(--radix-dropdown-menu-content-transform-origin)",
            }}
            className={cn(
              "min-w-[8rem] overflow-hidden rounded-xl border border-border bg-card p-1.5 text-foreground shadow-[0_12px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
              className,
            )}
          >
            {children}
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    )}
  </AnimatePresence>
));
MotionDropdownContent.displayName = "MotionDropdownContent";
