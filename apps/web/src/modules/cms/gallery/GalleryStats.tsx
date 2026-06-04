"use client";

import { cn } from "@/lib/utils";
import type { GalleryStats as Stats } from "./gallery.types";

export function GalleryStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Galleries", value: stats.total, sub: "Active", subCls: "text-primary" },
    { label: "Live Items Listed", value: stats.totalItems, sub: "Assets", subCls: "text-emerald-500" },
    { label: "Published", value: stats.published, sub: "Online", subCls: "text-muted-foreground" },
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
