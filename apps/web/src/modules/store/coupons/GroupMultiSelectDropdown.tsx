"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ApiCustomerGroup } from "@/lib/api";

interface GroupMultiSelectDropdownProps {
  groups: ApiCustomerGroup[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

/** Closed-by-default dropdown checklist for picking which customer groups a coupon is restricted to. Empty selection = usable by anyone. */
export function GroupMultiSelectDropdown({ groups, selectedIds, onToggle, className }: GroupMultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const summary =
    selectedIds.length === 0
      ? "Any customer"
      : groups
          .filter((g) => selectedIds.includes(g.id))
          .map((g) => g.name)
          .join(", ") || `${selectedIds.length} selected`;

  return (
    <div className={`relative ${className ?? ""}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-left outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 cursor-pointer"
      >
        <span className={`truncate ${selectedIds.length === 0 ? "text-muted-foreground" : "text-foreground"}`}>{summary}</span>
        <ChevronDown size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {groups.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">No customer groups configured.</p>
          ) : (
            groups.map((g) => (
              <label key={g.id} className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(g.id)}
                  onChange={() => onToggle(g.id)}
                  className="w-4 h-4 rounded-sm accent-primary cursor-pointer"
                />
                <span className="text-foreground">{g.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
