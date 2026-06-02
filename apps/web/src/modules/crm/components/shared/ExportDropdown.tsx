"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPORT_OPTIONS = [
  { id: "csv",  label: "Export as CSV",   icon: FileSpreadsheet, desc: "Comma-separated values" },
  { id: "xlsx", label: "Export as Excel", icon: FileSpreadsheet, desc: "Microsoft Excel format"  },
  { id: "pdf",  label: "Export as PDF",   icon: FileText,        desc: "Printable document"     },
  { id: "json", label: "Export as JSON",  icon: FileJson,        desc: "Raw data format"        },
];

export function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium",
          "transition-all duration-150 cursor-pointer",
          isOpen
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.12 } }}
            className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border bg-card shadow-glass-lg overflow-hidden"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          >
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Export contacts
            </p>
            {EXPORT_OPTIONS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
