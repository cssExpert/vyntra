"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTROL_H } from "./controls";
import {
  FIELD_ICON_OPTIONS,
  FieldIcon,
} from "../field-icons";
import type { FormFieldIcon } from "../forms.types";

export interface IconPickerProps {
  /** Currently selected icon (or "none"/undefined). */
  value?: FormFieldIcon;
  onChange: (icon: FormFieldIcon) => void;
  label?: string;
}

/**
 * Compact leading-icon picker — a trigger button plus a portalled grid popover
 * of the available field icons. Built to mirror {@link ColorPickerPopover} so
 * the two builder controls look and behave the same.
 */
export function IconPicker({ value = "none", onChange, label = "Icon" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number }>({
    left: 0,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const current = FIELD_ICON_OPTIONS.find((o) => o.value === value) ?? FIELD_ICON_OPTIONS[0];

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const left = r.left;
      if (window.innerHeight - r.bottom >= 280) {
        setCoords({ top: r.bottom + 6, bottom: undefined, left });
      } else {
        setCoords({ top: undefined, bottom: window.innerHeight - r.top + 6, left });
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
    <div ref={triggerRef} className="inline-flex items-center">
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
        title="Leading icon"
      >
        <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">
          <current.Icon className="h-4 w-4" />
        </span>
        {label}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              ...(coords.top !== undefined ? { top: coords.top } : {}),
              ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
              left: coords.left,
              zIndex: 9999,
            }}
            className="w-[248px] rounded-xl border border-border bg-card p-2 shadow-xl"
          >
            <div className="grid grid-cols-5 gap-1.5">
              {FIELD_ICON_OPTIONS.map((opt) => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg border transition-colors",
                      active
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <FieldIcon name={opt.value} className="h-4 w-4" />
                    {opt.value === "none" && (
                      <opt.Icon className="h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
