"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Printer, Send, Loader2, X, ChevronDown, User, MapPin, CreditCard, Tag, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreOrder, OrderStatus, OrderAddress } from "../store.types";
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

function Card({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        {Icon && <Icon size={15} className="text-muted-foreground" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

function AddressBlock({ address }: { address: OrderAddress }) {
  return (
    <div className="text-sm space-y-0.5">
      <p className="font-medium">{address.name}</p>
      <p className="text-muted-foreground">
        {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
        {address.city}, {address.state} {address.zip}, {address.country}
      </p>
      {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
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
  const billingSameAsShipping =
    order.billingAddress && order.shippingAddress &&
    JSON.stringify(order.billingAddress) === JSON.stringify(order.shippingAddress);

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
          {/* Left column */}
          <div className="col-span-2 space-y-6">
            <Card title={t("items")}>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 rounded-sm object-cover border border-border shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku}{item.variantLabel && ` · ${item.variantLabel}`} · Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium">{formatStorePrice(item.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">{formatStorePrice(item.unitPrice)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-sm pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatStorePrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Discount{order.couponCode && ` (${order.couponCode})`}
                    </span>
                    <span className="text-success">-{formatStorePrice(order.discount)}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatStorePrice(order.shipping)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatStorePrice(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1.5 border-t">
                  <span>Total</span>
                  <span>{formatStorePrice(order.total)}</span>
                </div>
              </div>
            </Card>

            {(order.shippingAddress || order.billingAddress) && (
              <Card title="Addresses" icon={MapPin}>
                <div className="grid grid-cols-2 gap-6">
                  {order.shippingAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Shipping Address</p>
                      <AddressBlock address={order.shippingAddress} />
                    </div>
                  )}
                  {order.billingAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Billing Address {billingSameAsShipping && <span className="italic">(same as shipping)</span>}
                      </p>
                      <AddressBlock address={order.billingAddress} />
                    </div>
                  )}
                </div>
                {(order.shippingMethod || order.trackingNumber) && (
                  <div className="grid grid-cols-2 gap-6 pt-3 border-t text-sm">
                    {order.shippingMethod && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Shipping Method</p>
                        <p>{order.shippingMethod}</p>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Tracking Number</p>
                        <p className="font-mono">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {!!order.payments?.length && (
              <Card title="Payments" icon={CreditCard}>
                <ul className="divide-y divide-border text-sm">
                  {order.payments.map((p) => (
                    <li key={p.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium capitalize">{p.method} — {formatStorePrice(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.transactionId && `${p.transactionId} · `}{new Date(p.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge
                        variant={p.status === "succeeded" || p.status === "completed" ? "success" : p.status === "failed" ? "error" : "muted"}
                        label={p.status}
                        size="sm"
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {!!order.refunds?.length && (
              <Card title="Refunds">
                <ul className="divide-y divide-border text-sm">
                  {order.refunds.map((r) => (
                    <li key={r.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{formatStorePrice(r.amount)}</p>
                        <StatusBadge variant={r.status === "completed" ? "success" : "muted"} label={r.status} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.reason} · {new Date(r.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {order.notes && (
              <Card title="Notes" icon={FileText}>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
              </Card>
            )}

            {!!order.timeline?.length && (
              <Card title="Order Timeline">
                <ul className="space-y-3">
                  {order.timeline.map((entry) => (
                    <li key={entry.id} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium capitalize">{entry.status.replace(/_/g, " ")}</p>
                        {entry.message && <p className="text-muted-foreground text-xs mt-0.5">{entry.message}</p>}
                        <p className="text-muted-foreground text-xs mt-0.5">{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Right column */}
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
                <StatusBadge variant={paymentBadge?.variant ?? "muted"} label={paymentBadge ? t(paymentBadge.label) : order.paymentStatus} size="sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("totalHeader")}</p>
                <p className="text-xl font-bold">{formatStorePrice(order.total)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("dateHeader")}</p>
                <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <Card title="Customer" icon={User}>
              <div className="text-sm space-y-1.5">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
                {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
              </div>
              <button
                onClick={() => router.push(`/store/customers/${order.customerId}`)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                View Customer Profile →
              </button>
            </Card>

            {order.couponCode && (
              <Card title="Coupon" icon={Tag}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono font-medium">{order.couponCode}</span>
                  <span className="text-success font-semibold">-{formatStorePrice(order.discount)}</span>
                </div>
              </Card>
            )}
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
