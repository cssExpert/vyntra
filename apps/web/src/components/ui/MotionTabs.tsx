"use client";

import { useState } from "react";
import Link from "next/link";
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
  /** When set, renders the tab as a Next.js Link for route-based navigation. */
  href?: string;
}

export type MotionTabsSize = "sm" | "default" | "lg";

const sizeStyles: Record<
  MotionTabsSize,
  { strip: string; tab: string; indicator: string; icon: string; badge: string }
> = {
  sm: {
    strip: "p-0.5 rounded-lg",
    tab: "py-1.5 px-2 rounded-md text-xs",
    indicator: "rounded-md",
    icon: "w-3 h-3",
    badge: "min-w-[1rem] h-4 px-1 text-[9px] leading-4",
  },
  default: {
    strip: "p-1 rounded-xl",
    tab: "py-2 px-2.5 rounded-lg text-xs lg:text-sm",
    indicator: "rounded-lg",
    icon: "w-3.5 h-3.5",
    badge: "min-w-[1.25rem] h-5 px-1.5 text-[10px] leading-5",
  },
  lg: {
    strip: "p-1.5 rounded-xl",
    tab: "py-2.5 px-4 rounded-lg text-sm lg:text-base",
    indicator: "rounded-lg",
    icon: "w-4 h-4",
    badge: "min-w-[1.5rem] h-5 px-1.5 text-xs leading-5",
  },
};

interface MotionTabsProps<T extends string = string> {
  tabs: MotionTabItem<T>[];
  /** Controlled active tab. Omit to let the component manage its own state. */
  active?: T;
  onChange?: (id: T) => void;
  /** Must be unique per page when rendering multiple MotionTabs instances. */
  layoutId?: string;
  /** Tab size. Defaults to "default" (current look). */
  size?: MotionTabsSize;
  className?: string;
  contentClassName?: string;
}

export function MotionTabs<T extends string = string>({
  tabs,
  active: controlledActive,
  onChange,
  layoutId = "motion-tab-indicator",
  size = "default",
  className,
  contentClassName,
}: MotionTabsProps<T>) {
  const sizing = sizeStyles[size];
  const [internalActive, setInternalActive] = useState<T>(tabs[0]?.id as T);

  const active = controlledActive ?? internalActive;

  const handleChange = (id: T) => {
    if (controlledActive === undefined) setInternalActive(id);
    onChange?.(id);
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={`${className}`}>
      <div
        className={cn(
          "flex items-center gap-1 border border-border bg-card flex-wrap @xxl:flex-nowrap",
          sizing.strip,
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const sharedClass = cn(
            "relative flex-1",
            sizing.tab,
            "flex items-center justify-center gap-2",
            "font-medium cursor-pointer",
            "transition-colors duration-150 md:text-nowrap",
            isActive
              ? "text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground",
          );
          const inner = (
            <>
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className={cn(
                    "absolute inset-0 bg-primary shadow-md",
                    sizing.indicator,
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {Icon && (
                <Icon className={cn("relative z-10 shrink-0", sizing.icon)} />
              )}
              <span className="relative z-10 hidden sm:inline">
                {tab.label}
              </span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "relative z-10 rounded-full font-bold text-center tabular-nums",
                    sizing.badge,
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </>
          );
          return tab.href ? (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => handleChange(tab.id)}
              className={sharedClass}
            >
              {inner}
            </Link>
          ) : (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleChange(tab.id)}
              className={sharedClass}
            >
              {inner}
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
