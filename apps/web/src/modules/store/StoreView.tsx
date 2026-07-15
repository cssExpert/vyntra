"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Plus,
  RefreshCw,
  TrendingUp,
  BarChart2,
  Zap,
  AlertTriangle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  storeAnalytics,
  storeOrders,
  storeInventory,
  type ApiDashboardMetrics,
  type ApiStoreOrder,
  type ApiInventoryItem,
} from "@/lib/api";
import type { StatCardData } from "@/types";

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Mini revenue bars ────────────────────────────────────────────────────────

function RevenueMiniChart({ data }: { data: { month: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 mt-2">
      {data.map((d, i) => {
        const pct = (d.revenue / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={`${d.month}-${i}`} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
              className={cn(
                "w-full rounded-t-sm min-h-[3px]",
                isLast ? "bg-primary" : "bg-primary/25",
              )}
            />
            <span className="text-[9px] text-muted-foreground">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Order badge map ──────────────────────────────────────────────────────────

const ORDER_BADGE: Record<
  string,
  { variant: "success" | "warning" | "info" | "error" | "muted" | "default"; label: string }
> = {
  pending:    { variant: "warning", label: "Pending" },
  processing: { variant: "info",    label: "Processing" },
  shipped:    { variant: "default", label: "Shipped" },
  delivered:  { variant: "success", label: "Delivered" },
  cancelled:  { variant: "error",   label: "Cancelled" },
  refunded:   { variant: "muted",   label: "Refunded" },
  on_hold:    { variant: "warning", label: "On Hold" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildStatsFromDashboard(data: ApiDashboardMetrics): StatCardData[] {
  const { salesMetrics: s, customerMetrics: c } = data;
  return [
    {
      id: "revenue",
      title: "Total Revenue",
      value: s.totalRevenue,
      change: 0,
      icon: "DollarSign",
      color: "success",
      prefix: "$",
      sparklineData: data.revenueTrends.slice(-7).map((t) => t.revenue),
    },
    {
      id: "orders",
      title: "Total Orders",
      value: s.totalOrders,
      change: 0,
      icon: "ShoppingBag",
      color: "brand",
      sparklineData: data.revenueTrends.slice(-7).map((t) => t.orderCount),
    },
    {
      id: "customers",
      title: "Customers",
      value: c.totalCustomers,
      change: 0,
      icon: "Users2",
      color: "purple",
    },
    {
      id: "new_customers",
      title: "New This Month",
      value: c.newCustomersThisMonth,
      change: 0,
      icon: "Users2",
      color: "info",
    },
    {
      id: "aov",
      title: "Avg. Order Value",
      value: s.averageOrderValue,
      change: 0,
      icon: "BarChart3",
      color: "warning",
      prefix: "$",
    },
    {
      id: "vip",
      title: "VIP Customers",
      value: c.vipCount,
      change: 0,
      icon: "Star",
      color: "success",
    },
  ];
}

function groupTrendsByPeriod(
  trends: { date: string; revenue: number; orderCount: number }[],
  periods = 6,
): { month: string; revenue: number }[] {
  if (!trends.length) return [];
  const size = Math.max(1, Math.ceil(trends.length / periods));
  const result: { month: string; revenue: number }[] = [];
  for (let i = 0; i < periods; i++) {
    const slice = trends.slice(i * size, (i + 1) * size);
    if (!slice.length) continue;
    const revenue = slice.reduce((s, t) => s + t.revenue, 0);
    const d = new Date(slice[0].date);
    result.push({
      month: d.toLocaleString("en", { month: "short", day: "numeric" }),
      revenue,
    });
  }
  return result;
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function StoreView() {
  const t = useTranslations("store");
  const isLoaded = usePageLoad(700);

  const [dashboard, setDashboard] = useState<ApiDashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<ApiStoreOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<ApiInventoryItem[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAll = useCallback(async () => {
    setFetchError(false);
    try {
      const [dash, ordersRes, lowStock] = await Promise.all([
        storeAnalytics.dashboard(),
        storeOrders.list({ take: 5 }),
        storeInventory.getLowStock(),
      ]);
      setDashboard(dash);
      setRecentOrders(ordersRes.data);
      setLowStockItems(lowStock.slice(0, 4));
    } catch {
      setFetchError(true);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshKey]);

  const stats      = dashboard ? buildStatsFromDashboard(dashboard) : [];
  const chartData  = dashboard ? groupTrendsByPeriod(dashboard.revenueTrends) : [];
  const thisMonth  = dashboard?.revenueTrends.reduce((s, t) => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      ? s + t.revenue
      : s;
  }, 0) ?? 0;
  const ytdTotal = dashboard?.revenueTrends.reduce((s, t) => s + t.revenue, 0) ?? 0;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="space-y-6"
        >
          <div className="h-10 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Page header */}
            <motion.div variants={itemVariants}>
              <PageHeader title={t("title")} description={t("description")}>
                <button
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="flex items-center gap-2 rounded-sm border border-border bg-white dark:bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {t("refresh", { defaultValue: "Refresh" })}
                  </span>
                </button>
                <Link
                  href="/store/products/add"
                  className="group flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all duration-200 cursor-pointer"
                >
                  <Plus
                    size={16}
                    className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
                  />
                  {t("addProduct")}
                </Link>
              </PageHeader>
            </motion.div>

            {fetchError && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
              >
                Failed to load store data. <button className="underline" onClick={() => setRefreshKey((k) => k + 1)}>Retry</button>
              </motion.div>
            )}

            {/* Stats grid */}
            {stats.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat, i) => (
                  <div key={stat.id} className="xl:col-span-1 sm:col-span-1">
                    <StatCard data={stat} index={i} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {/* Row 1: Revenue + Recent Orders + Low Stock */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Revenue mini chart */}
              <SectionCard
                title={t("revenueoverview", { defaultValue: "Revenue Overview" })}
                description={t("monthlyrevenuelast6", { defaultValue: "Revenue (last 30 days)" })}
                action={{ label: "Full Report", href: "/store/reports" }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">
                      ${thisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">This month</p>
                  </div>
                  {thisMonth > 0 && (
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp size={14} />
                    </div>
                  )}
                </div>
                {chartData.length > 0 ? (
                  <RevenueMiniChart data={chartData} />
                ) : (
                  <div className="h-20 mt-2 bg-muted/30 rounded-sm animate-pulse" />
                )}
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">Revenue</span>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground">30-day Total</p>
                    <p className="text-sm font-bold text-foreground">
                      ${ytdTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* Recent Orders */}
              <SectionCard
                title={t("recentorders", { defaultValue: "Recent Orders" })}
                action={{ label: "View All", href: "/store/orders" }}
              >
                {recentOrders.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 opacity-30" size={28} />
                    <p className="text-xs">No recent orders.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentOrders.map((order) => {
                      const badge = ORDER_BADGE[order.status] ?? { variant: "muted" as const, label: order.status };
                      return (
                        <div
                          key={order.id}
                          className="flex items-center gap-3 rounded-sm p-2 hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
                            {order.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {order.customerName}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {order.orderNumber}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="text-xs font-bold text-foreground tabular-nums">
                              ${order.total.toFixed(2)}
                            </span>
                            <StatusBadge variant={badge.variant} label={badge.label} size="sm" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Low Stock */}
              <SectionCard
                title={t("lowstockalerts", { defaultValue: "Low Stock Alerts" })}
                description={`${lowStockItems.length} item${lowStockItems.length !== 1 ? "s" : ""} need attention`}
                action={{ label: "Manage", href: "/store/inventory" }}
              >
                {lowStockItems.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 opacity-30" size={28} />
                    <p className="text-xs">All products are well-stocked.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {lowStockItems.map((item) => {
                      const isOut = item.stock === 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-sm p-2 hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <div
                            className={cn(
                              "h-7 w-7 shrink-0 rounded-sm flex items-center justify-center",
                              isOut ? "bg-error/10" : "bg-warning/10",
                            )}
                          >
                            <AlertTriangle
                              size={13}
                              className={isOut ? "text-error" : "text-warning"}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {item.product.sku}
                            </p>
                          </div>
                          <StatusBadge
                            variant={isOut ? "error" : "warning"}
                            label={isOut ? "Out" : `${item.stock} left`}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Row 2: Top Products + Active Automations */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Top Products */}
              <SectionCard
                title={t("topproducts", { defaultValue: "Top Products" })}
                description={t("bestsellingproductsthismonth", { defaultValue: "Best-selling products" })}
                action={{ label: "All Products", href: "/store/products" }}
              >
                {dashboard?.topProducts?.length ? (
                  <div className="space-y-3">
                    {dashboard.topProducts.slice(0, 5).map((product, i) => {
                      const maxSales = Math.max(...(dashboard.topProducts.map((p) => p.totalSold)), 1);
                      const pct = (product.totalSold / maxSales) * 100;
                      return (
                        <div key={product.productId} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-4 shrink-0 font-mono">
                            {i + 1}
                          </span>
                          <div className="h-7 w-7 shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                            <Package size={12} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {product.productName}
                            </p>
                            <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.07 }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground shrink-0 tabular-nums">
                            {product.totalSold} sold
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <BarChart2 className="mx-auto mb-2 opacity-30" size={28} />
                    <p className="text-xs">No product sales data yet.</p>
                  </div>
                )}
              </SectionCard>

              {/* Active Automations — placeholder until automations backend is live */}
              <SectionCard
                title={t("activeautomations", { defaultValue: "Active Automations" })}
                description={t("runningworkflowsinyour", { defaultValue: "Running workflows in your store" })}
                action={{ label: "Manage", href: "/store/automations" }}
              >
                <div className="space-y-1.5">
                  {[
                    { name: "Welcome Email",            runs: "—", color: "text-success" },
                    { name: "Abandoned Cart Recovery",  runs: "—", color: "text-primary" },
                    { name: "Low Stock Alert",          runs: "—", color: "text-warning" },
                    { name: "First Purchase Reward",    runs: "—", color: "text-info" },
                    { name: "VIP Store Credit",         runs: "—", color: "text-purple-400" },
                  ].map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-sm p-2 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="h-7 w-7 shrink-0 rounded-sm bg-primary/10 flex items-center justify-center">
                        <Zap size={12} className="text-primary" />
                      </div>
                      <p className="flex-1 text-xs font-medium text-foreground truncate">{a.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-muted-foreground tabular-nums">{a.runs}</span>
                        <BarChart2 size={10} className={a.color} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
