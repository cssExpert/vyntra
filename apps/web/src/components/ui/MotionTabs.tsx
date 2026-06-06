"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MotionTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  /** Badge count or label shown as a pill next to the tab label. */
  badge?: number | string;
  content?: React.ReactNode;
}

interface MotionTabsProps<T extends string = string> {
  tabs: MotionTabItem<T>[];
  /** Controlled active tab. Omit to let the component manage its own state. */
  active?: T;
  onChange?: (id: T) => void;
  /** Must be unique per page when rendering multiple MotionTabs instances. */
  layoutId?: string;
  className?: string;
  contentClassName?: string;
}

export function MotionTabs<T extends string = string>({
  tabs,
  active: controlledActive,
  onChange,
  layoutId = "motion-tab-indicator",
  className,
  contentClassName,
}: MotionTabsProps<T>) {
  const [internalActive, setInternalActive] = useState<T>(tabs[0]?.id as T);

  const active = controlledActive ?? internalActive;

  const handleChange = (id: T) => {
    if (controlledActive === undefined) setInternalActive(id);
    onChange?.(id);
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className={cn(
                "relative flex-1 py-2 px-2.5 rounded-lg",
                "flex items-center justify-center gap-2",
                "text-xs lg:text-sm font-medium cursor-pointer",
                "transition-colors duration-150 md:text-nowrap",
                isActive
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg bg-primary shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {Icon && <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />}
              <span className="relative z-10 hidden sm:inline">
                {tab.label}
              </span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "relative z-10 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold leading-5 text-center tabular-nums",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab?.content !== undefined && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn("mt-4", contentClassName)}
          >
            {activeTab.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
