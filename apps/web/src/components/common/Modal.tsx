"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  xxl: "max-w-6xl",
  xxxl: "max-w-9xl",
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: "default" | "danger";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: keyof typeof maxWidthMap;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconVariant = "default",
  children,
  footer,
  maxWidth = "lg",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30,
              mass: 0.8,
              bounce: 0.15,
            }}
            className={`bg-card rounded-2xl w-full ${maxWidthMap[maxWidth]} shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border overflow-hidden relative z-10`}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon && (
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      iconVariant === "danger"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 ml-4 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-muted/40 border-t border-border flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
