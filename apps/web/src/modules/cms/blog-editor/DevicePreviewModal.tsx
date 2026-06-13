"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Tablet, Smartphone, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";
import type { BlogFormState } from "./types";

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: { id: Device; icon: LucideIcon }[] = [
  { id: "desktop", icon: Laptop },
  { id: "tablet", icon: Tablet },
  { id: "mobile", icon: Smartphone },
];

export interface DevicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: BlogFormState;
}

// Wrap every <table> in a horizontally-scrollable container so wide tables
// scroll on narrow (mobile/tablet) preview widths instead of overflowing.
function wrapTables(html: string): string {
  return html
    .replace(
      /<table/g,
      '<div class="table-container"><table class="device-preview"',
    )
    .replace(/<\/table>/g, "</table></div>");
}

export function DevicePreviewModal({
  isOpen,
  onClose,
  form,
}: DevicePreviewModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.blog-editor");
  const [device, setDevice] = useState<Device>("desktop");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Site base URL from the org's configured domain (CMS Settings → Domain),
  // shown protocol-less in the fake browser address bar.
  const { previewUrl } = useSitePreviewUrl();
  const siteHost = (previewUrl() ?? "vyntra.io").replace(/^https?:\/\//, "");

  const articleHtml = wrapTables(
    form.content ||
      "<p class='text-muted-foreground italic'>Start writing to preview your article…</p>",
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex flex-col"
        >
          {/* Top bar */}
          <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                Device Layout Inspector
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Preview layout adjustments before publishing
              </p>
            </div>

            <div className="flex bg-muted rounded-lg p-0.5 border border-border">
              {DEVICES.map((dev) => {
                const Icon = dev.icon;
                return (
                  <Button
                    key={dev.id}
                    variant="ghost"
                    size="icon"
                    onClick={() => setDevice(dev.id)}
                    active={device === dev.id}
                    className="p-1.5 h-auto w-auto rounded-md"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                );
              })}
            </div>

            <Button
              variant="muted"
              size="sm"
              onClick={onClose}
            >
              Close inspector
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
            <motion.div
              key={device}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full ${
                device === "desktop"
                  ? "max-w-5xl"
                  : device === "tablet"
                    ? "max-w-lg"
                    : "max-w-xs"
              }`}
            >
              <div className="device-preview rounded-2xl border border-border bg-card shadow-2xl overflow-hidden my-4">
                {/* Browser chrome */}
                <div className="px-4 py-2 bg-muted border-b border-border flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  <div className="flex gap-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="truncate text-center flex-1 pr-6">
                    {siteHost}/blog/{form.slug || "untitled-post"}
                  </span>
                </div>

                {/* Article */}
                <div className="p-6 space-y-4 max-h-[580px] overflow-y-auto">
                  {form.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.coverImage}
                      alt=""
                      className="w-full aspect-[21/9] object-cover rounded-xl"
                    />
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {form.category}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {form.readTime}m read
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {form.title || "Untitled Post"}
                  </h1>
                  {form.subtitle && (
                    <p className="text-muted-foreground text-xs italic">
                      {form.subtitle}
                    </p>
                  )}
                  <hr className="border-border" />
                  <div
                    className="tiptap max-w-none"
                    dangerouslySetInnerHTML={{ __html: articleHtml }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
