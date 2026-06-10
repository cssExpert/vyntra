"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import type { AuthorProfile, BlogFormState } from "./types";

export interface PublishSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: BlogFormState;
  seoScore: number;
  availableAuthors: AuthorProfile[];
  onCopyLink: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  published: "text-emerald-500",
  draft: "text-amber-500",
  scheduled: "text-blue-500",
};

export function PublishSummaryModal({
  isOpen,
  onClose,
  form,
  seoScore,
  availableAuthors,
  onCopyLink,
}: PublishSummaryModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const authorName =
    availableAuthors.find((a) => a.id === form.author)?.name ??
    form.author ??
    "—";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full space-y-5"
          >
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {form.status === "published"
                    ? "Published!"
                    : "Saved Successfully"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  <strong className="text-foreground">
                    &ldquo;{form.title}&rdquo;
                  </strong>{" "}
                  {form.status === "scheduled"
                    ? `is scheduled for ${form.publishDate} at ${form.publishTime}.`
                    : form.status === "published"
                      ? "is now live and visible to your audience."
                      : "has been saved as a draft."}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-4 bg-muted/50 rounded-xl text-left space-y-2 text-[10px] font-mono border border-border">
              <Row label="SLUG" value={`/blog/${form.slug}`} />
              <Row label="AUTHOR" value={authorName} />
              <Row label="CATEGORIES" value={form.category.join(", ") || "—"} />
              <Row
                label="TAGS"
                value={
                  form.tags.length > 0
                    ? `${form.tags.length} tag${form.tags.length !== 1 ? "s" : ""}`
                    : "—"
                }
              />
              <Row label="READ TIME" value={`${form.readTime} min`} />
              <Row
                label="STATUS"
                value={form.status.toUpperCase()}
                valueClass={STATUS_STYLE[form.status] ?? "text-primary"}
              />
              <Row
                label="SEO GRADE"
                value={`${seoScore}/100`}
                valueClass={
                  seoScore >= 80
                    ? "text-emerald-500"
                    : seoScore >= 40
                      ? "text-amber-500"
                      : "text-rose-500"
                }
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onCopyLink}
                className="py-2 bg-muted hover:bg-muted/70 text-xs font-semibold rounded-lg text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </button>
              {form.status === "published" && form.slug && (
                <a
                  href={`/blog/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 bg-muted hover:bg-muted/70 text-xs font-semibold rounded-lg text-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Post
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`py-2 bg-primary hover:bg-primary-600 text-xs font-semibold rounded-lg text-primary-foreground transition-colors ${
                  form.status !== "published" || !form.slug ? "col-span-2" : ""
                }`}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
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
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className={`truncate text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
