"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  const iconBg    = variant === "danger" ? "bg-rose-500/10"   : "bg-amber-500/10";
  const iconBorder= variant === "danger" ? "border-rose-500/20": "border-amber-500/20";
  const iconColor = variant === "danger" ? "text-rose-500"     : "text-amber-500";
  const btnCls    = variant === "danger"
    ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500/40 shadow-rose-500/20"
    : "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500/40 shadow-amber-500/20";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog card */}
          <motion.div
            key="confirm-card"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95,  y: 8  }}
            transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.9 }}
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              radius="lg"
              onClick={onCancel}
              className="absolute top-4 right-4 h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Body */}
            <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.06 }}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border-2",
                  iconBg, iconBorder,
                )}
              >
                <AlertTriangle className={cn("w-7 h-7", iconColor)} />
              </motion.div>

              {/* Text */}
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="outline"
                size="lg"
                radius="xl"
                onClick={onCancel}
                className="flex-1 font-semibold text-muted-foreground hover:text-foreground"
              >
                {cancelLabel}
              </Button>
              <Button
                size="lg"
                radius="xl"
                onClick={onConfirm}
                className={cn(
                  "flex-1 font-bold text-white shadow-md focus-visible:ring-2",
                  btnCls,
                )}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
