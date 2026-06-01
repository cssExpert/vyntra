"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";

export interface DateRangePickerProps {
  /** ISO date strings (yyyy-mm-dd) or "" */
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
}

function toDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISO(d: Date | null): string {
  if (!d) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "Start Date To End Date",
}: DateRangePickerProps) {
  const start = toDate(startDate);
  const end = toDate(endDate);

  return (
    <div className="relative vyntra-datepicker">
      <DatePicker
        selectsRange
        startDate={start}
        endDate={end}
        onChange={(dates) => {
          const [s, e] = dates as [Date | null, Date | null];
          onChange(toISO(s), toISO(e));
        }}
        dateFormat="MM-dd-yyyy"
        placeholderText={placeholder}
        isClearable
        wrapperClassName="w-full"
        className="w-full pl-3 pr-10 py-3 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
        popperClassName="vyntra-datepicker-popper"
      />
      <Calendar
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}
