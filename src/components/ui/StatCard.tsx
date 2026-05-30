"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users2,
  Gauge,
  ShoppingBag,
  Mail,
  Phone,
  BarChart3,
  CreditCard,
  LucideIcon,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { StatCardData } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  DollarSign,
  Users2,
  Gauge,
  ShoppingBag,
  Mail,
  Phone,
  BarChart3,
  CreditCard,
  TrendingUp,
};

const colorStyles = {
  brand: {
    icon: "bg-brand-500/15 text-brand-400",
    glow: "group-hover:shadow-glow-brand",
    border: "hover:border-brand-500/30",
  },
  success: {
    icon: "bg-success/15 text-success",
    glow: "group-hover:shadow-glow-success",
    border: "hover:border-success/30",
  },
  warning: {
    icon: "bg-warning/15 text-warning",
    glow: "",
    border: "hover:border-warning/30",
  },
  error: {
    icon: "bg-error/15 text-error",
    glow: "group-hover:shadow-glow-error",
    border: "hover:border-error/30",
  },
  info: {
    icon: "bg-info/15 text-info",
    glow: "",
    border: "hover:border-info/30",
  },
  purple: {
    icon: "bg-purple-500/15 text-purple-400",
    glow: "",
    border: "hover:border-purple-500/30",
  },
  cyan: {
    icon: "bg-cyan-500/15 text-cyan-400",
    glow: "",
    border: "hover:border-cyan-500/30",
  },
};

// Tiny sparkline SVG
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  const fillPath = `M ${first} L ${polyline} L ${last.split(",")[0]},${height} L ${first.split(",")[0]},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`spark-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={positive ? "#22c55e" : "#ef4444"}
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={positive ? "#22c55e" : "#ef4444"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#spark-${positive})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StatCardProps {
  data: StatCardData;
  index?: number;
}

export function StatCard({ data, index = 0 }: StatCardProps) {
  const Icon = ICONS[data.icon] ?? DollarSign;
  const styles = colorStyles[data.color];
  const isPositive = data.change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const displayValue =
    typeof data.value === "number"
      ? `${data.prefix ?? ""}${formatNumber(data.value)}${data.suffix ?? ""}`
      : `${data.prefix ?? ""}${data.value}${data.suffix ?? ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      className={cn(
        "group stat-card border transition-all duration-300 h-auto lg:h-full",
        styles.border,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {data.sparklineData && (
          <Sparkline data={data.sparklineData} positive={isPositive} />
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <motion.p
          className="text-2xl font-bold font-display text-foreground tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.07 + 0.2 }}
        >
          {displayValue}
        </motion.p>
      </div>

      {/* Title */}
      <p className="text-sm text-muted-foreground mb-3">{data.title}</p>

      {/* Change */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            isPositive ? "text-success" : "text-error",
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {Math.abs(data.change)}%
        </span>
        {data.changeLabel && (
          <span className="text-xs text-muted-foreground">
            {data.changeLabel}
          </span>
        )}
      </div>
    </motion.div>
  );
}
