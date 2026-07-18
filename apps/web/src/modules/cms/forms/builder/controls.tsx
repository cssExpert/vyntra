"use client";

import type { ReactNode } from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for form-builder control sizing/appearance.
 * Change the height here and every input / select / toggle / colour picker
 * in the builder follows.
 */
export const CONTROL_H = "h-9";

/** Shared base classes for text inputs and selects in the builder. */
export const CONTROL_BASE =
  "rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Optional tooltip — shown on hover (use with icon labels). */
  tooltip?: string;
}

/**
 * Segmented pill toggle (e.g. Stacked/Inline, Left/Center/Right). One
 * implementation shared across the builder so every toggle matches.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  fullWidth = false,
  className,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** "md" matches other h-9 controls; "sm" is a compact inline toggle. */
  size?: "sm" | "md";
  /** Stretch the group to fill its container, buttons sharing the width evenly. */
  fullWidth?: boolean;
  className?: string;
}) {
  const height = size === "sm" ? "h-8" : CONTROL_H;
  const px = size === "sm" ? "px-2.5" : "px-3";
  const hasTooltips = options.some((o) => o.tooltip);

  const group = (
    <div
      className={cn(
        "items-stretch rounded-lg border border-border overflow-hidden",
        fullWidth ? "flex w-full" : "inline-flex",
        height,
        className,
      )}
    >
      {options.map((o, i) => {
        const btn = (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(o.value);
            }}
            className={cn(
              px,
              "inline-flex items-center justify-center text-xs font-medium whitespace-nowrap transition-colors",
              fullWidth && "flex-1",
              i > 0 && "border-l border-border",
              value === o.value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
        return o.tooltip ? (
          <Tooltip key={o.value}>
            <TooltipTrigger asChild>{btn}</TooltipTrigger>
            <TooltipContent>{o.tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <span key={o.value} className="contents">
            {btn}
          </span>
        );
      })}
    </div>
  );

  return hasTooltips ? (
    <TooltipProvider delayDuration={300}>{group}</TooltipProvider>
  ) : (
    group
  );
}

const ALIGN_ICON = "w-3.5 h-3.5";

/** Shared icon-with-tooltip alignment options (Left/Center/Right). */
export const ALIGN_OPTIONS: SegmentedOption<"left" | "center" | "right">[] = [
  { value: "left", label: <AlignLeft className={ALIGN_ICON} />, tooltip: "Left" },
  { value: "center", label: <AlignCenter className={ALIGN_ICON} />, tooltip: "Center" },
  { value: "right", label: <AlignRight className={ALIGN_ICON} />, tooltip: "Right" },
];
