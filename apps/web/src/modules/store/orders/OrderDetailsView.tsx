"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer, Download, Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreOrder } from "../store.types";
import { SAMPLE_ORDERS } from "../store.data";
import { ORDER_STATUS_BADGES, PAYMENT_STATUS_BADGES } from "../store.constants";
import { formatStorePrice } from "../store.utils";

interface OrderDetailsViewProps {
  orderId: string;
}

export function OrderDetailsView({ orderId }: OrderDetailsViewProps) {
  const t = useTranslations("store.orders");
  const router = useRouter();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const found = SAMPLE_ORDERS.find((o) => o.id === orderId);
        setOrder(found || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-96"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">{t("noOrders")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge = ORDER_STATUS_BADGES[order.status];
  const paymentBadge = PAYMENT_STATUS_BADGES[order.paymentStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={`${t("orderHeader")} #${order.id}`}
        description={`${t("customer")}: ${order.customerName}`}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/orders" },
          { label: order.id },
        ]}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Printer size={16} />
            {t("print")}
          </Button>
          <Button variant="outline" size="lg">
            <Download size={16} />
            {t("export")}
          </Button>
          <Button size="lg">
            <Send size={16} />
            {t("send")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="font-semibold">{t("items")}</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatStorePrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("orderHeader")}</p>
              <p className="font-mono text-sm">#{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("statusHeader")}</p>
              <p className="text-sm">{t(statusBadge.label)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("paymentHeader")}</p>
              <p className="text-sm">{t(paymentBadge.label)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("totalHeader")}</p>
              <p className="text-xl font-bold">{formatStorePrice(order.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <h3 className="font-semibold">{t("details")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("dateHeader")}</p>
            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("customerHeader")}</p>
            <p>{order.customerName}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
