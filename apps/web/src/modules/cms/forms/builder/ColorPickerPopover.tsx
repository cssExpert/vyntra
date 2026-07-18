"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sketch } from "@uiw/react-color";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTROL_H } from "./controls";

/** Preset swatches — same set as the Settings colour pickers. */
const SWATCH_PRESETS = [
  "#F76235",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#000000",
  "#ffffff",
];

export interface ColorPickerPopoverProps {
  label: string;
  /** Current colour (hex) or undefined when using the theme default. */
  value?: string;
  onChange: (hex: string) => void;
  /** Clears back to the theme default. */
  onClear?: () => void;
  /** Swatch shown when no colour is set. */
  fallback?: string;
}

/**
 * Compact colour trigger + @uiw/react-color Sketch popover (same picker as the
 * Settings pages). The popover renders in a portal and flips above the trigger
 * when there isn't room below.
 */
export function ColorPickerPopover({
  label,
  value,
  onChange,
  onClear,
  fallback = "#94a3b8",
}: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const right = window.innerWidth - r.right;
      if (window.innerHeight - r.bottom >= 320) {
        setCoords({ top: r.bottom + 6, bottom: undefined, right });
      } else {
        setCoords({ top: undefined, bottom: window.innerHeight - r.top + 6, right });
      }
    }
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        popoverRef.current &&
        !popoverRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={triggerRef} className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className={cn(
          CONTROL_H,
          "inline-flex items-center gap-2 rounded-lg border px-2.5 text-xs font-medium text-foreground transition-colors",
          open ? "border-primary bg-muted" : "border-border bg-background hover:bg-muted",
        )}
      >
        <span
          className="w-4 h-4 rounded-full border border-border/60"
          style={{ backgroundColor: value || fallback }}
        />
        {label}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {value && onClear && (
        <button
          type="button"
          title="Reset to default"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="text-muted-foreground/60 hover:text-rose-500 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              ...(coords.top !== undefined ? { top: coords.top } : {}),
              ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
              right: coords.right,
              zIndex: 9999,
            }}
            className="drop-shadow-xl rounded-md overflow-hidden border border-border"
          >
            <Sketch
              color={value || fallback}
              presetColors={SWATCH_PRESETS}
              onChange={(c) => onChange(c.hex)}
              style={
                {
                  "--sketch-background": "hsl(var(--card))",
                } as React.CSSProperties
              }
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
