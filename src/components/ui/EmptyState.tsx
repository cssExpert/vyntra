"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  const sizeStyles = {
    sm: { wrapper: "py-8", icon: "h-8 w-8", iconWrap: "h-14 w-14", title: "text-sm", desc: "text-xs" },
    md: { wrapper: "py-12", icon: "h-10 w-10", iconWrap: "h-18 w-18", title: "text-base", desc: "text-sm" },
    lg: { wrapper: "py-20", icon: "h-12 w-12", iconWrap: "h-20 w-20", title: "text-lg", desc: "text-base" },
  };

  const s = sizeStyles[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center justify-center text-center", s.wrapper, className)}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-2xl bg-muted/60 border border-border",
          size === "sm" ? "h-14 w-14" : size === "md" ? "h-16 w-16" : "h-20 w-20"
        )}
      >
        <Icon className={cn("text-muted-foreground/60", s.icon)} />
      </div>
      <h3 className={cn("font-semibold text-foreground mb-1", s.title)}>{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-xs", s.desc)}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
                     hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
