"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Printer, Send, Loader2, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreOrder, OrderStatus } from "../store.types";
import { ORDER_STATUS_BADGES, PAYMENT_STATUS_BADGES } from "../store.constants";
import { formatStorePrice, toStoreOrder } from "../store.utils";
import { storeOrders } from "@/lib/api";

interface OrderDetailsViewProps {
  orderId: string;
}

const ORDER_STATUSES = [
  { value: "pending",    label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "on_hold",   label: "On Hold" },
  { value: "shipped",   label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded",  label: "Refunded" },
];

function UpdateStatusModal({
  orderId,
  currentStatus,
  onClose,
  onSaved,
}: {
  orderId: string;
  currentStatus: string;
  onClose: () => void;
  onSaved: (status: string) => void;
}) {
  const [status, setStatus]   = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === currentStatus) { onClose(); return; }
    setSaving(true);
    setError("");
    try {
      await storeOrders.updateStatus(orderId, status, message || undefined);
      onSaved(status);
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Update Order Status</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none cursor-pointer"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Note to customer (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="e.g. Your order has shipped via UPS…"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" radius="sm" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" radius="sm" className="flex-1" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Update"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function OrderDetailsView({ orderId }: OrderDetailsViewProps) {
  const t = useTranslations("store.orders");
  const router = useRouter();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const found = await storeOrders.get(orderId);
        setOrder(toStoreOrder(found));
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!order) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{t("noOrders")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge  = ORDER_STATUS_BADGES[order.status];
  const paymentBadge = PAYMENT_STATUS_BADGES[order.paymentStatus];

  const handlePrint = () => window.print();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex flex-col gap-6"
      >
        <PageHeader
          title={`${t("orderHeader")} ${order.orderNumber}`}
          description={`${t("customer")}: ${order.customerName}`}
          breadcrumbs={[
            { label: t("store"), href: "/store" },
            { label: t("title"), href: "/store/orders" },
            { label: order.orderNumber },
          ]}
        >
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={handlePrint}>
              <Printer size={16} />
              {t("print")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowStatusModal(true)}
              className="gap-1"
            >
              <ChevronDown size={14} />
              Update Status
            </Button>
            <Button size="lg" disabled title="Email sending not configured yet">
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
                    <p className="font-medium">{formatStorePrice(item.totalPrice)}</p>
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
                <p className="font-mono text-sm">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("statusHeader")}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge
                    variant={statusBadge?.variant ?? "muted"}
                    label={statusBadge ? t(statusBadge.label) : order.status}
                    size="sm"
                    dot
                  />
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
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

      {showStatusModal && (
        <UpdateStatusModal
          orderId={orderId}
          currentStatus={order.status}
          onClose={() => setShowStatusModal(false)}
          onSaved={(newStatus) => {
            setOrder((prev) => prev ? { ...prev, status: newStatus as OrderStatus } : prev);
            setShowStatusModal(false);
          }}
        />
      )}
    </>
  );
}
