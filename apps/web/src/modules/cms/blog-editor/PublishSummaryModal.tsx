"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { BlogFormState } from "./types";

export interface PublishSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: BlogFormState;
  seoScore: number;
  onCopyLink: () => void;
}

export function PublishSummaryModal({
  isOpen,
  onClose,
  form,
  seoScore,
  onCopyLink,
}: PublishSummaryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">
                Successfully Configured!
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                The blog post titled{" "}
                <strong className="text-foreground">
                  &ldquo;{form.title}&rdquo;
                </strong>{" "}
                has been saved.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl text-left space-y-2 text-[10px] font-mono border border-border">
              <Row label="SLUG" value={`/blog/${form.slug}`} />
              <Row label="CATEGORY" value={form.category} />
              <Row
                label="SEO GRADE"
                value={`${seoScore}/100`}
                valueClass="text-emerald-500"
              />
              <Row
                label="STATUS"
                value={form.status.toUpperCase()}
                valueClass="text-primary font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onCopyLink}
                className="py-2 bg-muted hover:bg-muted/70 text-xs font-semibold rounded-lg text-foreground transition-colors"
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 bg-primary hover:bg-primary/90 text-xs font-semibold rounded-lg text-primary-foreground transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  valueClass = "text-foreground",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`truncate ${valueClass}`}>{value}</span>
    </div>
  );
}
