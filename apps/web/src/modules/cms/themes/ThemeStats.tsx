"use client";

import { cn } from "@/lib/utils";
import type { GalleryStats } from "../gallery/gallery.types";

export function ThemeStats({ stats }: { stats: GalleryStats }) {
  const cards = [
    { label: "Total Themes", value: stats.total, sub: "Available", subCls: "text-primary" },
    { label: "Total Sections", value: stats.totalItems, sub: "Across All", subCls: "text-emerald-500" },
    { label: "Published", value: stats.published, sub: "Live", subCls: "text-muted-foreground" },
    { label: "Draft Status", value: stats.drafts, sub: "In Progress", subCls: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((s) => (
        <div key={s.label} className="bg-card/50 border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">{s.value}</span>
            <span className={cn("text-xs font-medium", s.subCls)}>{s.sub}</span>
          </div>
        </div>
      ))}
      <div className="col-span-2 lg:col-span-1 bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Aggregated Views</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-foreground">{(stats.totalViews / 1000).toFixed(1)}k</span>
          <span className="text-xs text-primary/70 font-medium">+12% wk</span>
        </div>
      </div>
    </div>
  );
}
