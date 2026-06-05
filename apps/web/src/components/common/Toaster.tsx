"use client";

/**
 * Reusable Toaster — bottom-right, solid fills, theme-variable-aware.
 *
 * Usage:
 *   const { toasts, addToast, dismiss } = useToaster();
 *   ...
 *   addToast("Saved!", "success");
 *   <Toaster toasts={toasts} onDismiss={dismiss} />
 */

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ── Per-type visual config ─────────────────────────────────────────────────────
// Solid fills that adapt to both light and dark themes:
//   success → emerald-500  (always white text)
//   error   → rose-500     (always white text)
//   warning → amber-500    (always white text)
//   info    → bg-foreground / text-background  (inverted theme variables —
//             mirrors ThemeToggle's active-button logic of bg-background/text-foreground)

const TOAST_CONFIG = {
  success: {
    bg:       "bg-emerald-500",
    text:     "text-white",
    Icon:     CheckCircle2,
    iconCls:  "text-white/80",
    closeCls: "text-white/60 hover:text-white hover:bg-white/10",
  },
  error: {
    bg:       "bg-rose-500",
    text:     "text-white",
    Icon:     XCircle,
    iconCls:  "text-white/80",
    closeCls: "text-white/60 hover:text-white hover:bg-white/10",
  },
  warning: {
    bg:       "bg-amber-500",
    text:     "text-white",
    Icon:     Info,
    iconCls:  "text-white/80",
    closeCls: "text-white/60 hover:text-white hover:bg-white/10",
  },
  info: {
    bg:       "bg-foreground",
    text:     "text-background",
    Icon:     Info,
    iconCls:  "text-background/70",
    closeCls: "text-background/50 hover:text-background hover:bg-background/10",
  },
} as const;

// ── Component ──────────────────────────────────────────────────────────────────

interface ToasterProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[250] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const cfg = TOAST_CONFIG[toast.type];
          const { Icon } = cfg;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 56, scale: 0.92 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 56, scale: 0.9  }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "pointer-events-auto flex items-center gap-3",
                "pl-3.5 pr-2.5 py-3 rounded-xl shadow-lg",
                "min-w-[220px] max-w-sm w-max",
                cfg.bg, cfg.text,
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", cfg.iconCls)} />

              <p className="text-sm font-medium flex-1 leading-snug">
                {toast.message}
              </p>

              <button
                onClick={() => onDismiss(toast.id)}
                className={cn(
                  "shrink-0 p-1 rounded-md transition-colors cursor-pointer",
                  cfg.closeCls,
                )}
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useToaster(durationMs = 4000) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastItem["type"] = "info") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        durationMs,
      );
    },
    [durationMs],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss } as const;
}
