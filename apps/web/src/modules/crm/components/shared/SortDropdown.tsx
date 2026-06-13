"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortOption {
  id: string;
  label: string;
  field: string;
  order: "asc" | "desc";
}

interface SortDropdownProps {
  activeSort: string;
  onSortChange: (option: SortOption) => void;
}

export function SortDropdown({ activeSort, onSortChange }: SortDropdownProps) {
  const t = useTranslations("crm");
  const SORT_OPTIONS: SortOption[] = [
    {
      id: "created_desc",
      label: t("sortOptions.createdDesc"),
      field: "createdAt",
      order: "desc",
    },
    {
      id: "created_asc",
      label: t("sortOptions.createdAsc"),
      field: "createdAt",
      order: "asc",
    },
    {
      id: "name_asc",
      label: t("sortOptions.nameAsc"),
      field: "name",
      order: "asc",
    },
    {
      id: "name_desc",
      label: t("sortOptions.nameDesc"),
      field: "name",
      order: "desc",
    },
    {
      id: "value_desc",
      label: t("sortOptions.valueDesc"),
      field: "value",
      order: "desc",
    },
    {
      id: "value_asc",
      label: t("sortOptions.valueAsc"),
      field: "value",
      order: "asc",
    },
    {
      id: "activity_desc",
      label: t("sortOptions.activityDesc"),
      field: "lastActivity",
      order: "desc",
    },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded-xl bg-white dark:bg-muted border px-4 py-2.5 text-sm font-medium",
          "transition-all duration-150 cursor-pointer",
          isOpen
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        {t("sort")}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -6,
              transition: { duration: 0.12 },
            }}
            className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card shadow-glass-lg overflow-hidden"
            style={{
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("sortBy")}
            </p>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onSortChange(opt);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer",
                  activeSort === opt.id
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {opt.label}
                {activeSort === opt.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
