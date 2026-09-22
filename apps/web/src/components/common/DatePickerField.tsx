"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerFieldProps {
  /** ISO date string (yyyy-mm-dd) or "". */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Extra classes appended to the input (e.g. a fixed height). */
  inputClassName?: string;
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

export function DatePickerField({
  value,
  onChange,
  placeholder = "MM / DD / YYYY",
  inputClassName,
}: DatePickerFieldProps) {
  return (
    <div className="relative erv-datepicker">
      <DatePicker
        selected={toDate(value)}
        onChange={(d: Date | null) => onChange(toISO(d))}
        dateFormat="MM / dd / yyyy"
        placeholderText={placeholder}
        wrapperClassName="w-full"
        className={cn(
          "w-full pl-3 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all",
          inputClassName,
        )}
        popperClassName="erv-datepicker-popper"
      />
      <Calendar
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}
