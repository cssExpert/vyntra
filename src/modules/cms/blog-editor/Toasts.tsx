"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}

const ICONS: Record<ToastType, typeof AlertCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success:
    "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400",
  error:
    "bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400",
  warning:
    "bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400",
  info: "bg-card border-border text-foreground",
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={() => onDismiss(toast.id)}
              className={`pointer-events-auto cursor-pointer px-4 py-2.5 rounded-xl border shadow-lg flex items-center gap-2.5 text-xs font-semibold ${STYLES[toast.type]}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
