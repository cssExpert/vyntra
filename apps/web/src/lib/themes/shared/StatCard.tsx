"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Hex accent for the icon circle background/foreground — defaults to the shopingo orange. */
  accentColor?: string;
}

/** Icon-circle + big number + label, structurally mirroring components/ui/StatCard.tsx but self-contained for the storefront theme layer. */
export function StatCard({ icon: Icon, label, value, accentColor = "#e4611e" }: StatCardProps) {
  return (
    <div className="flex-1 min-w-[150px] bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
