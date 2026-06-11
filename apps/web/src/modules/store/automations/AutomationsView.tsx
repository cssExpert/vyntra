"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import {
  Plus,
  Zap,
  Eye,
  Pencil,
  Trash2,
  Play,
  Pause,
  ShoppingCart,
  UserPlus,
  Package,
  Bell,
  RefreshCw,
} from "lucide-react";
import { SAMPLE_AUTOMATIONS } from "../store.data";
import type { AutomationRule, AutomationTrigger } from "../store.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TRIGGER_ICONS: Partial<Record<AutomationTrigger, React.ReactNode>> = {
  customer_registered: <UserPlus size={14} />,
  customer_first_purchase: <ShoppingCart size={14} />,
  abandoned_cart: <ShoppingCart size={14} />,
  product_low_stock: <Package size={14} />,
  order_delivered: <Bell size={14} />,
  order_paid: <RefreshCw size={14} />,
};

const TRIGGER_LABELS: Partial<Record<AutomationTrigger, string>> = {
  customer_registered: "Customer Registered",
  customer_first_purchase: "First Purchase",
  abandoned_cart: "Abandoned Cart",
  product_low_stock: "Product Low Stock",
  order_delivered: "Order Delivered",
  order_paid: "Order Paid",
  order_cancelled: "Order Cancelled",
  subscription_renewed: "Subscription Renewed",
  reward_milestone: "Reward Milestone",
};

export function AutomationsView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("store.automations");
  const isLoaded = usePageLoad(600);
  const [rules, setRules] = useState(SAMPLE_AUTOMATIONS);

  const toggleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "active" ? "paused" : "active" }
          : r,
      ),
    );
  };

  const activeCount = rules.filter((r) => r.status === "active").length;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title="Store Automations"
            description={`${activeCount} active automations running`}
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "Automations" },
            ]}
          >
            <Button size="lg" radius="sm" className="px-5">
              <Plus
                size={18}
                className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
              />
              New Automation
            </Button>
          </PageHeader>

          {/* Quick stat */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Active", value: activeCount, color: "text-success" },
              {
                label: "Paused",
                value: rules.filter((r) => r.status === "paused").length,
                color: "text-warning",
              },
              {
                label: "Total Runs",
                value: rules
                  .reduce((s, r) => s + r.runCount, 0)
                  .toLocaleString(),
                color: "text-info",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card p-3 flex items-center gap-3"
              >
                <Zap size={15} className={s.color} />
                <div>
                  <p className={`text-lg font-extrabold ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Automation cards */}
          <div className="space-y-3">
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                layout
                className={cn(
                  "bg-card rounded-xl border px-5 py-4 flex items-center gap-4 transition-colors",
                  rule.status === "active"
                    ? "border-border hover:border-primary/30"
                    : "border-border opacity-60",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-sm flex items-center justify-center",
                    rule.status === "active"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {TRIGGER_ICONS[rule.trigger] ?? <Zap size={14} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-[13px]">
                      {rule.name}
                    </p>
                    {rule.isBuiltIn && (
                      <span className="text-[10px] font-semibold bg-info/10 text-info px-1.5 py-0.5 rounded-full">
                        Built-in
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rule.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      Trigger:{" "}
                      <span className="text-foreground font-medium">
                        {TRIGGER_LABELS[rule.trigger] ?? rule.trigger}
                      </span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Runs:{" "}
                      <span className="text-foreground font-semibold tabular-nums">
                        {rule.runCount.toLocaleString()}
                      </span>
                    </span>
                    {rule.lastRunAt && (
                      <span className="text-[11px] text-muted-foreground">
                        Last:{" "}
                        <span className="text-foreground">
                          {new Date(rule.lastRunAt).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <StatusBadge
                  variant={
                    rule.status === "active"
                      ? "success"
                      : rule.status === "paused"
                        ? "warning"
                        : "muted"
                  }
                  label={
                    rule.status.charAt(0).toUpperCase() + rule.status.slice(1)
                  }
                  size="sm"
                  dot
                />

                {/* Toggle */}
                <button
                  onClick={() => toggleStatus(rule.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-all cursor-pointer border",
                    rule.status === "active"
                      ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                      : "border-success/30 bg-success/10 text-success hover:bg-success/20",
                  )}
                >
                  {rule.status === "active" ? (
                    <Pause size={11} />
                  ) : (
                    <Play size={11} />
                  )}
                  {rule.status === "active" ? "Pause" : "Activate"}
                </button>

                <TableActionMenu
                  items={[
                    {
                      label: "View",
                      icon: <Eye size={14} />,
                      onClick: () => {},
                    },
                    {
                      label: "Edit",
                      icon: <Pencil size={14} />,
                      onClick: () => {},
                    },
                    {
                      label: "Delete",
                      icon: <Trash2 size={14} />,
                      onClick: () => {},
                      variant: "danger",
                      separator: true,
                    },
                  ]}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
