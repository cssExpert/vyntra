"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Plus,
  RefreshCw,
  TrendingUp,
  MoveRight,
  BarChart2,
  Zap,
  AlertTriangle,
  Package,
} from "lucide-react";
import {
  STORE_STATS,
  SAMPLE_ORDERS,
  SAMPLE_PRODUCTS,
  SAMPLE_INVENTORY,
  STORE_REVENUE_DATA,
} from "./store.data";
import { cn } from "@/lib/utils";

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Section Card (matches DashboardView pattern) ─────────────────────────────

function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn("glass-card p-5", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && (
          <a
            href={action.href}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {action.label}
            <MoveRight className="h-3 w-3" />
          </a>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Mini revenue bars ────────────────────────────────────────────────────────

function RevenueMiniChart() {
  const max = Math.max(...STORE_REVENUE_DATA.map((d) => d.revenue));
  return (
    <div className="flex items-end gap-1.5 h-20 mt-2">
      {STORE_REVENUE_DATA.map((d, i) => {
        const pct = (d.revenue / max) * 100;
        const isLast = i === STORE_REVENUE_DATA.length - 1;
        return (
          <div
            key={d.month}
            className="flex flex-col items-center gap-1 flex-1"
          >
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
  {
    variant: "success" | "warning" | "info" | "error" | "muted" | "default";
    label: string;
  }
> = {
  pending: { variant: "warning", label: "Pending" },
  processing: { variant: "info", label: "Processing" },
  shipped: { variant: "default", label: "Shipped" },
  delivered: { variant: "success", label: "Delivered" },
  cancelled: { variant: "error", label: "Cancelled" },
  refunded: { variant: "muted", label: "Refunded" },
  on_hold: { variant: "warning", label: "On Hold" },
};

// ─── Main view ────────────────────────────────────────────────────────────────

export function StoreView() {
  const t = useTranslations("store");
  const isLoaded = usePageLoad(700);
  const lowStockItems = SAMPLE_INVENTORY.filter(
    (i) => i.stockStatus === "low_stock" || i.stockStatus === "out_of_stock",
  );

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
                <button className="flex items-center gap-2 rounded-sm border border-border bg-white dark:bg-muted px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {t("refresh", { defaultValue: "Refresh" })}
                  </span>
                </button>
                <a
                  href="/store/products/add"
                  className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all duration-200 cursor-pointer"
                >
                  <Plus
                    size={18}
                    className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
                  />
                  {t("addProduct")}
                </a>
              </PageHeader>
            </motion.div>

            {/* Stats grid — uses the same StatCard as Dashboard */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {STORE_STATS.map((stat, i) => (
                <div key={stat.id} className="xl:col-span-1 sm:col-span-1">
                  <StatCard data={stat} index={i} />
                </div>
              ))}
            </div>

            {/* Row 1: Revenue + Recent Orders + Low Stock */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Revenue mini chart */}
              <SectionCard
                title={t("revenueoverview", {
                  defaultValue: "Revenue Overview",
                })}
                description={t("monthlyrevenuelast6", {
                  defaultValue: "Monthly revenue (last 6 months)",
                })}
                action={{ label: "Full Report", href: "/store/reports" }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">
                      $48,290
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This month
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-success">
                    <TrendingUp size={14} />
                    <span className="text-sm font-semibold">+12.4%</span>
                  </div>
                </div>
                <RevenueMiniChart />
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">
                      Revenue
                    </span>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground">YTD Total</p>
                    <p className="text-sm font-bold text-foreground">
                      $219,490
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* Recent Orders */}
              <SectionCard
                title={t("recentorders", { defaultValue: "Recent Orders" })}
                action={{ label: "View All", href: "/store/orders" }}
              >
                <div className="space-y-1.5">
                  {SAMPLE_ORDERS.slice(0, 5).map((order) => {
                    const badge = ORDER_BADGE[order.status];
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
                          <StatusBadge
                            variant={badge.variant}
                            label={badge.label}
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Low Stock */}
              <SectionCard
                title={t("lowstockalerts", {
                  defaultValue: "Low Stock Alerts",
                })}
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
                    {lowStockItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-sm p-2 hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <div
                          className={cn(
                            "h-7 w-7 shrink-0 rounded-sm flex items-center justify-center",
                            item.stockStatus === "out_of_stock"
                              ? "bg-error/10"
                              : "bg-warning/10",
                          )}
                        >
                          <AlertTriangle
                            size={13}
                            className={
                              item.stockStatus === "out_of_stock"
                                ? "text-error"
                                : "text-warning"
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {item.sku}
                          </p>
                        </div>
                        <StatusBadge
                          variant={
                            item.stockStatus === "out_of_stock"
                              ? "error"
                              : "warning"
                          }
                          label={
                            item.stockStatus === "out_of_stock"
                              ? "Out"
                              : `${item.stock} left`
                          }
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Row 2: Top Products + Active Automations */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Top Products */}
              <SectionCard
                title={t("topproducts", { defaultValue: "Top Products" })}
                description={t("bestsellingproductsthismonth", {
                  defaultValue: "Best-selling products this month",
                })}
                action={{ label: "All Products", href: "/store/products" }}
              >
                <div className="space-y-3">
                  {SAMPLE_PRODUCTS.filter((p) => (p.totalSales ?? 0) > 0)
                    .sort((a, b) => (b.totalSales ?? 0) - (a.totalSales ?? 0))
                    .slice(0, 5)
                    .map((product, i) => {
                      const maxSales = SAMPLE_PRODUCTS.reduce(
                        (m, p) => Math.max(m, p.totalSales ?? 0),
                        0,
                      );
                      const pct = ((product.totalSales ?? 0) / maxSales) * 100;
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3"
                        >
                          <span className="text-xs text-muted-foreground w-4 shrink-0 font-mono">
                            {i + 1}
                          </span>
                          <div className="h-7 w-7 shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                            {product.featuredImage ? (
                              <Image
                                src={product.featuredImage}
                                alt="Image"
                                width={28}
                                height={28}
                                className="h-7 w-7 object-cover"
                              />
                            ) : (
                              <Package
                                size={12}
                                className="text-muted-foreground"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {product.name}
                            </p>
                            <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{
                                  duration: 0.6,
                                  ease: "easeOut",
                                  delay: i * 0.07,
                                }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground shrink-0 tabular-nums">
                            {product.totalSales} sold
                          </span>
                        </div>
                      );
                    })}
                </div>
              </SectionCard>

              {/* Active Automations */}
              <SectionCard
                title={t("activeautomations", {
                  defaultValue: "Active Automations",
                })}
                description={t("runningworkflowsinyour", {
                  defaultValue: "Running workflows in your store",
                })}
                action={{ label: "Manage", href: "/store/automations" }}
              >
                <div className="space-y-1.5">
                  {[
                    { name: "Welcome Email", runs: 892, color: "text-success" },
                    {
                      name: "Abandoned Cart Recovery",
                      runs: 1234,
                      color: "text-primary",
                    },
                    {
                      name: "Low Stock Alert",
                      runs: 47,
                      color: "text-warning",
                    },
                    {
                      name: "First Purchase Reward",
                      runs: 318,
                      color: "text-info",
                    },
                    {
                      name: "VIP Store Credit",
                      runs: 12,
                      color: "text-purple-400",
                    },
                  ].map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-sm p-2 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="h-7 w-7 shrink-0 rounded-sm bg-primary/10 flex items-center justify-center">
                        <Zap size={12} className="text-primary" />
                      </div>
                      <p className="flex-1 text-xs font-medium text-foreground truncate">
                        {a.name}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {a.runs.toLocaleString()}
                        </span>
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
