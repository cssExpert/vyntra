"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, RefreshCw, BarChart2, Package } from "lucide-react";
import { STORE_REVENUE_DATA, SAMPLE_PRODUCTS, SAMPLE_ORDERS } from "../store.data";
import { cn } from "@/lib/utils";

const PERIODS = ["7D", "30D", "90D", "12M"] as const;
type Period = typeof PERIODS[number];

function MetricCard({ label, value, change, icon, color }: { label: string; value: string; change: number; icon: React.ReactNode; color: string }) {
  const up = change >= 0;
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className={cn("opacity-70", color)}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {up ? <TrendingUp size={11} className="text-success" /> : <TrendingDown size={11} className="text-error" />}
          <span className={cn("text-[11px] font-semibold", up ? "text-success" : "text-error")}>
            {up ? "+" : ""}{change}%
          </span>
          <span className="text-[11px] text-muted-foreground">vs prior period</span>
        </div>
      </div>
    </div>
  );
}

function RevenueBar({ data }: { data: typeof STORE_REVENUE_DATA }) {
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = (d.revenue / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[10px] text-muted-foreground font-mono">${(d.revenue / 1000).toFixed(0)}k</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
              className={cn("w-full rounded-t-sm min-h-[4px]", isLast ? "bg-primary" : "bg-primary/25")}
            />
            <span className="text-[10px] text-muted-foreground">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StoreReportsView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("store.reports");
  const isLoaded  = usePageLoad(700);
  const [period, setPeriod] = useState<Period>("30D");

  const topProducts = [...SAMPLE_PRODUCTS]
    .sort((a, b) => (b.totalSales ?? 0) - (a.totalSales ?? 0))
    .slice(0, 5);

  const ordersByStatus = [
    { label: "Delivered",  count: SAMPLE_ORDERS.filter((o) => o.status === "delivered").length,  color: "bg-success" },
    { label: "Processing", count: SAMPLE_ORDERS.filter((o) => o.status === "processing").length, color: "bg-info" },
    { label: "Pending",    count: SAMPLE_ORDERS.filter((o) => o.status === "pending").length,    color: "bg-warning" },
    { label: "Cancelled",  count: SAMPLE_ORDERS.filter((o) => o.status === "cancelled").length,  color: "bg-error" },
  ];
  const totalOrders = ordersByStatus.reduce((s, o) => s + o.count, 0);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-6">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
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
            breadcrumbs={[{ label: "Store", href: "/store" }, { label: "Reports" }]}
          >
            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "relative px-3 min-h-9 max-h-9 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer",
                    period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {period === p && (
                    <motion.div
                      layoutId="store-reports-period"
                      className="absolute inset-0 rounded-lg bg-background shadow-sm -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </PageHeader>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Revenue"     value="$48,290"  change={12.4}  icon={<DollarSign size={16} />}  color="text-success" />
            <MetricCard label="Orders"      value="1,284"    change={8.1}   icon={<ShoppingCart size={16} />} color="text-info" />
            <MetricCard label="New Customers" value="148"    change={5.3}   icon={<Users size={16} />}       color="text-purple-400" />
            <MetricCard label="Refund Rate" value="2.8%"     change={-0.4}  icon={<RefreshCw size={16} />}   color="text-error" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue bars */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue</p>
                </div>
                <BarChart2 size={16} className="text-muted-foreground" />
              </div>
              <RevenueBar data={STORE_REVENUE_DATA} />
            </div>

            {/* Orders by status */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Orders by Status</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{totalOrders} total orders</p>
                </div>
                <ShoppingCart size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {ordersByStatus.map((o) => (
                  <div key={o.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{o.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: totalOrders > 0 ? `${(o.count / totalOrders) * 100}%` : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full", o.color)}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground tabular-nums w-6 text-right">{o.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top products */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Top Products by Sales</h3>
              <Package size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const maxSales = topProducts[0].totalSales ?? 1;
                const pct = ((p.totalSales ?? 0) / maxSales) * 100;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 font-mono shrink-0">{i + 1}</span>
                    <div className="h-7 w-7 shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                      {p.featuredImage ? <img src={p.featuredImage} alt="" className="h-7 w-7 object-cover" /> : <Package size={12} className="text-muted-foreground" />}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate w-44 shrink-0">{p.name}</p>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.07 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">{p.totalSales} sold</span>
                    <span className="text-xs font-bold text-success tabular-nums shrink-0">${((p.totalSales ?? 0) * p.price).toFixed(0)}</span>
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
