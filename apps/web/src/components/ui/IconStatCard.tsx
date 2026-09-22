"use client";

import Link from "next/link";
import type { ElementType } from "react";

interface IconStatCardProps {
  label: string;
  value: number | string;
  icon: ElementType;
  iconClass: string;
  href?: string;
  sub?: string;
}

export function IconStatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  href,
  sub,
}: IconStatCardProps) {
  const inner = (
    <div className="h-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="w-full min-w-0">
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-0.5 whitespace-nowrap">
            {label}
          </p>
          <div className="flex-1 w-full flex justify-between items-end">
            <p className="text-2xl font-extrabold text-foreground leading-tight">
              {value}
            </p>
            {sub && (
              <p className="ml-auto text-xs text-muted-foreground whitespace-nowrap text-right relative -top-px">
                {sub}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}
