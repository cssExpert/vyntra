"use client";

import { PackageSearch, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
}

/** Theme-agnostic "nothing to show" placeholder, reusable across any block
 *  that renders a live datasource (products, categories, posts, etc.). */
export function EmptyState({
  icon: Icon = PackageSearch,
  title = "Nothing to show yet",
  message,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 px-6 text-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
        {message && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{message}</p>}
      </div>
    </div>
  );
}
