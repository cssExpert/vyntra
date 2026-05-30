import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "muted";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

// Light-mode text uses darker semantic shades to pass WCAG AA (4.5:1) on tinted bg.
// Dark-mode overrides restore the vivid color since the tinted bg is nearly black.
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/12 text-blue-700   dark:text-primary    border-primary/20",
  success: "bg-success/12 text-green-800  dark:text-success    border-success/20",
  warning: "bg-warning/12 text-amber-800  dark:text-warning    border-warning/20",
  error:   "bg-error/12   text-red-700    dark:text-error      border-error/20",
  info:    "bg-info/12    text-cyan-800   dark:text-info       border-info/20",
  purple:  "bg-purple-500/12 text-purple-800 dark:text-purple-400 border-purple-500/20",
  muted:   "bg-muted text-muted-foreground border-border",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  purple: "bg-purple-400",
  muted: "bg-muted-foreground",
};

export function StatusBadge({
  variant = "default",
  label,
  dot = false,
  size = "sm",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full",
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
            dotStyles[variant]
          )}
        />
      )}
      {label}
    </span>
  );
}

// Lead status helpers
export const LEAD_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  new: "info",
  contacted: "purple",
  qualified: "default",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "error",
};

export const PAYMENT_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "warning",
  completed: "success",
  failed: "error",
  refunded: "muted",
  disputed: "error",
};

export const CAMPAIGN_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  draft: "muted",
  scheduled: "info",
  sending: "default",
  sent: "success",
  paused: "warning",
  cancelled: "error",
};

export const ORDER_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "warning",
  processing: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "muted",
};
