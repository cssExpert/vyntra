"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { Clock } from "lucide-react";

export interface TimePickerFieldProps {
  /** 24-hour time string "HH:mm" or "". */
  value: string;
  onChange: (value: string) => void;
  /** Minute step for the dropdown. Default 15. */
  intervals?: number;
}

function toDate(hm: string): Date | null {
  if (!hm) return null;
  const [h, m] = hm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function toHM(d: Date | null): string {
  if (!d) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function TimePickerField({
  value,
  onChange,
  intervals = 15,
}: TimePickerFieldProps) {
  return (
    <div className="relative vyntra-datepicker">
      <DatePicker
        selected={toDate(value)}
        onChange={(d: Date | null) => onChange(toHM(d))}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={intervals}
        timeCaption="Time"
        dateFormat="h:mm aa"
        placeholderText="-- : --"
        wrapperClassName="w-full"
        className="w-full pl-3 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
        popperClassName="vyntra-datepicker-popper"
      />
      <Clock
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}
