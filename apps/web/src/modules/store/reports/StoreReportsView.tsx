"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatStorePrice } from "../store.utils";
import { storeAnalytics, storeOrders, type ApiDashboardMetrics, type ApiRevenueTrendPoint } from "@/lib/api";

const PERIODS = ["7D", "30D", "90D", "12M"] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_DAYS: Record<Period, number> = { "7D": 7, "30D": 30, "90D": 90, "12M": 365 };

function MetricCard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className={cn("opacity-70", color)}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-foreground">
          {value}
        </p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {up ? (
              <TrendingUp size={11} className="text-success" />
            ) : (
              <TrendingDown size={11} className="text-error" />
            )}
            <span
              className={cn(
                "text-[11px] font-semibold",
                up ? "text-success" : "text-error",
              )}
            >
              {up ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              vs prior period
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface RevenueBucket {
  label: string;
  revenue: number;
}

// The backend groups orders by UTC calendar date (`createdAt.toISOString().split('T')[0]`),
// so bucketing must use UTC dates too — local-time midnight can land on a different UTC day.
function dateKeyFromUtcOffset(todayUtcMs: number, daysAgo: number): string {
  return new Date(todayUtcMs - daysAgo * 86400000).toISOString().split("T")[0];
}

function bucketRevenueTrends(points: ApiRevenueTrendPoint[], days: number, targetBuckets: number): RevenueBucket[] {
  const byDate = new Map(points.map((p) => [p.date, p.revenue]));
  const now = new Date();
  const todayUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const bucketSize = Math.max(1, Math.ceil(days / targetBuckets));
  const numBuckets = Math.ceil(days / bucketSize);

  // Bucket 0 = most recent (offsets 0..bucketSize-1 days ago); higher offset = further in the past.
  const buckets: RevenueBucket[] = [];
  for (let b = 0; b < numBuckets; b++) {
    const startOffset = b * bucketSize;
    const endOffset = Math.min(startOffset + bucketSize - 1, days - 1);

    let revenue = 0;
    for (let offset = startOffset; offset <= endOffset; offset++) {
      revenue += byDate.get(dateKeyFromUtcOffset(todayUtcMs, offset)) ?? 0;
    }

    const labelDate = new Date(todayUtcMs - endOffset * 86400000);
    buckets.push({ label: labelDate.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }), revenue });
  }

  // Reverse so the chart reads oldest -> newest, left to right.
  return buckets.reverse();
}

function RevenueBar({ data }: { data: RevenueBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = (d.revenue / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div
            key={`${d.label}-${i}`}
            className="flex flex-col items-center gap-1.5 flex-1"
          >
            <span className="text-[10px] text-muted-foreground font-mono">
              ${(d.revenue / 1000).toFixed(1)}k
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
              className={cn(
                "w-full rounded-t-sm min-h-[4px]",
                isLast ? "bg-primary" : "bg-primary/25",
              )}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const ORDER_STATUS_ROWS: { status: string; label: string; color: string }[] = [
  { status: "delivered", label: "Delivered", color: "bg-success" },
  { status: "processing", label: "Processing", color: "bg-info" },
  { status: "pending", label: "Pending", color: "bg-warning" },
  { status: "cancelled", label: "Cancelled", color: "bg-error" },
];

export function StoreReportsView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("store.reports");
  const isLoaded = usePageLoad(700);
  const [period, setPeriod] = useState<Period>("30D");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ApiDashboardMetrics | null>(null);
  const [trendPoints, setTrendPoints] = useState<ApiRevenueTrendPoint[]>([]);
  const [priorTrendPoints, setPriorTrendPoints] = useState<ApiRevenueTrendPoint[]>([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState<Record<string, number>>({});
  const [totalOrders, setTotalOrders] = useState(0);

  const load = useCallback(async (p: Period) => {
    setIsLoading(true);
    try {
      const days = PERIOD_DAYS[p];
      // The backend caps revenue-trends at 365 days, so a doubled window (for a
      // "prior period" comparison) only fits when the period itself is <= 182 days.
      const canComparePrior = days * 2 <= 365;

      const [dashboardData, currentTrends, priorTrends, ordersRes] = await Promise.all([
        storeAnalytics.dashboard(),
        storeAnalytics.revenueTrends(days),
        canComparePrior ? storeAnalytics.revenueTrends(days * 2) : Promise.resolve([]),
        storeOrders.list({ take: 500 }),
      ]);
      setDashboard(dashboardData);
      setTrendPoints(currentTrends);
      // The older half of the doubled range is the "prior period"
      if (canComparePrior) {
        const now = new Date();
        const todayUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const cutoffKey = dateKeyFromUtcOffset(todayUtcMs, days);
        setPriorTrendPoints(priorTrends.filter((pt) => pt.date < cutoffKey));
      } else {
        setPriorTrendPoints([]);
      }

      const counts: Record<string, number> = {};
      for (const o of ordersRes.data) counts[o.status] = (counts[o.status] ?? 0) + 1;
      setOrderStatusCounts(counts);
      setTotalOrders(ordersRes.total);
    } catch {
      // keep previous state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [load, period]);

  const currentRevenue = trendPoints.reduce((s, p) => s + p.revenue, 0);
  const priorRevenue = priorTrendPoints.reduce((s, p) => s + p.revenue, 0);
  const revenueChange = priorRevenue > 0 ? ((currentRevenue - priorRevenue) / priorRevenue) * 100 : undefined;

  const currentOrderCount = trendPoints.reduce((s, p) => s + p.orderCount, 0);
  const priorOrderCount = priorTrendPoints.reduce((s, p) => s + p.orderCount, 0);
  const orderCountChange = priorOrderCount > 0 ? ((currentOrderCount - priorOrderCount) / priorOrderCount) * 100 : undefined;

  const revenueBuckets = bucketRevenueTrends(trendPoints, PERIOD_DAYS[period], 8);
  const topProducts = dashboard?.topProducts ?? [];
  const orderStatusRows = ORDER_STATUS_ROWS.map((row) => ({ ...row, count: orderStatusCounts[row.status] ?? 0 }));
  const statusRowsTotal = orderStatusRows.reduce((s, o) => s + o.count, 0);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded || isLoading ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-6">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <PageHeader
            title="Store Reports"
            description="Sales analytics, top products, and customer insights."
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "Reports" },
            ]}
          >
            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "relative px-3 min-h-9 max-h-9 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer",
                    period === p
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {period === p && (
                    <motion.div
                      layoutId="store-reports-period"
                      className="absolute inset-0 rounded-lg bg-background shadow-sm -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.35,
                      }}
                    />
                  )}
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </PageHeader>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Revenue"
              value={formatStorePrice(currentRevenue)}
              change={revenueChange}
              icon={<DollarSign size={16} />}
              color="text-success"
            />
            <MetricCard
              label="Orders"
              value={currentOrderCount.toLocaleString()}
              change={orderCountChange}
              icon={<ShoppingCart size={16} />}
              color="text-info"
            />
            <MetricCard
              label="New Customers"
              value={(dashboard?.customerMetrics.newCustomersThisMonth ?? 0).toLocaleString()}
              icon={<Users size={16} />}
              color="text-purple-400"
            />
            <MetricCard
              label="Avg Order Value"
              value={formatStorePrice(dashboard?.salesMetrics.averageOrderValue ?? 0)}
              icon={<BarChart2 size={16} />}
              color="text-warning"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue bars */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Revenue Trend
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {period} revenue
                  </p>
                </div>
                <BarChart2 size={16} className="text-muted-foreground" />
              </div>
              <RevenueBar data={revenueBuckets} />
            </div>

            {/* Orders by status */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Orders by Status
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalOrders} total orders
                  </p>
                </div>
                <ShoppingCart size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {orderStatusRows.map((o) => (
                  <div key={o.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      {o.label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            statusRowsTotal > 0
                              ? `${(o.count / statusRowsTotal) * 100}%`
                              : "0%",
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full", o.color)}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground tabular-nums w-6 text-right">
                      {o.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top products */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Top Products by Sales
              </h3>
              <Package size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No sales data yet.</p>
              ) : topProducts.map((p, i) => {
                const maxSales = topProducts[0].totalSold || 1;
                const pct = (p.totalSold / maxSales) * 100;
                return (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 font-mono shrink-0">
                      {i + 1}
                    </span>
                    <div className="h-7 w-7 shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                      <Package size={12} className="text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate w-44 shrink-0">
                      {p.productName}
                    </p>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.5,
                          ease: "easeOut",
                          delay: i * 0.07,
                        }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">
                      {p.totalSold} sold
                    </span>
                    <span className="text-xs font-bold text-success tabular-nums shrink-0">
                      {formatStorePrice(p.totalRevenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
