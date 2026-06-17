"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Download, Search, X } from "lucide-react";
import { OrdersTable } from "./components/OrdersTable";
import { SAMPLE_ORDERS } from "../store.data";
import type { OrderStatus } from "../store.types";
import { cn } from "@/lib/utils";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";
import { Input } from "@/components/ui/input";

const ORDER_TABS: MotionTabItem<"all" | OrderStatus>[] = [
  { id: "all", label: "all" },
  { id: "pending", label: "pending" },
  { id: "processing", label: "processing" },
  { id: "shipped", label: "shipped" },
  { id: "delivered", label: "delivered" },
  { id: "cancelled", label: "cancelled" },
  { id: "refunded", label: "refunded" },
];

const selectCls =
  "rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer";

export function OrdersView() {
  const t = useTranslations("store.orders");
  const isLoaded = usePageLoad(700);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("");

  const filtered = useMemo(() => {
    let r = SAMPLE_ORDERS;
    if (activeTab !== "all") r = r.filter((o) => o.status === activeTab);
    if (payFilter) r = r.filter((o) => o.paymentStatus === payFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q),
      );
    }
    return r;
  }, [activeTab, search, payFilter]);

  const total = SAMPLE_ORDERS.reduce((s, o) => s + o.total, 0);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div
          key="sk"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="space-y-4"
        >
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="h-8 w-full rounded-sm bg-muted animate-pulse" />
          <div className="h-72 w-full rounded-xl bg-muted animate-pulse" />
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
            title={t("title")}
            description={t("description", { defaultValue: `${SAMPLE_ORDERS.length} orders · $${total.toFixed(2)} total revenue` })}
            breadcrumbs={[
              { label: t("store"), href: "/store" },
              { label: t("title") },
            ]}
          >
            <button className="flex items-center gap-2 rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              {t("export")}
            </button>
          </PageHeader>

          <MotionTabs
            tabs={ORDER_TABS}
            active={activeTab}
            onChange={setActiveTab}
            layoutId="store-orders-tab"
            className="w-fit"
          />

          {/* Toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Search size={17} />
              </span>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                size="xl"
                className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={payFilter}
              onChange={(e) => setPayFilter(e.target.value)}
              className={selectCls}
            >
              <option value="">{t("allPayments")}</option>
              <option value="paid">{t("payPaid")}</option>
              <option value="pending">{t("payPending")}</option>
              <option value="failed">{t("payFailed")}</option>
              <option value="refunded">{t("payRefunded")}</option>
            </select>
          </div>

          <OrdersTable orders={filtered} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
