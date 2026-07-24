"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Trophy,
  Heart,
  ShoppingBag,
  X,
  Plus,
} from "lucide-react";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useCartStore } from "@/store/cartStore";
import { LoginForm, RegisterForm } from "@/lib/themes/shared/AuthForms";
import { AccountSidebar } from "@/lib/themes/shared/AccountSidebar";
import { StatCard } from "@/lib/themes/shared/StatCard";
import { StatusPill } from "@/lib/themes/shared/StatusPill";
import { rewardTierForPoints, pointsToNextTier, REWARD_TIER_THRESHOLDS } from "@/lib/themes/shared/rewardTier";
import { useWishlist } from "@/lib/themes/useWishlist";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";
import {
  useAccountProfile,
  useAccountOrders,
  useAccountOrder,
  useAccountAddresses,
  useAccountCreditTransactions,
  useAccountRewardTransactions,
  useAccountDownloads,
  changeAccountPassword,
  type AccountAddress,
  type AccountOrder,
} from "@/lib/themes/useAccount";

const ORANGE = "#e4611e";

function formatPrice(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// ── Auth gate ─────────────────────────────────────────────

function AuthGate({ orgId }: { orgId: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <section className="py-16 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-sm mx-auto px-6">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        {mode === "login" ? <LoginForm orgId={orgId} accentColor={ORANGE} /> : <RegisterForm orgId={orgId} accentColor={ORANGE} />}
        <p className="mt-5 text-xs text-center text-gray-500 dark:text-gray-400">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-semibold hover:underline" style={{ color: ORANGE }}>
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </section>
  );
}

// ── Reorder helper ────────────────────────────────────────

function useReorder(orgId: string) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const [reordering, setReordering] = useState(false);

  const reorder = async (order: AccountOrder) => {
    setReordering(true);
    try {
      for (const item of order.items) {
        await addItem(orgId, { productId: item.productId, variantId: item.variantId ?? undefined, quantity: item.quantity });
      }
      openDrawer();
      addToast("Items added to your cart", "success");
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Some items could no longer be added", "error");
    } finally {
      setReordering(false);
    }
  };

  return { reorder, reordering };
}

// ── Dashboard ──────────────────────────────────────────────

function DashboardTab({ orgId, name }: { orgId: string; name: string }) {
  const { profile, loading: profileLoading } = useAccountProfile(orgId, true);
  const { orders, loading: ordersLoading } = useAccountOrders(orgId, true);
  const { reorder, reordering } = useReorder(orgId);
  const recent = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
        Welcome back, {name}
      </h1>

      <div className="flex flex-wrap gap-3">
        <StatCard icon={Wallet} label="Store Credit" value={profileLoading ? "…" : formatPrice(profile?.storeCredit ?? 0)} accentColor={ORANGE} />
        <StatCard icon={Trophy} label="Reward Points" value={profileLoading ? "…" : `${profile?.rewardPoints ?? 0} pts`} accentColor="#a855f7" />
        <StatCard icon={Heart} label="Wishlist" value={profileLoading ? "…" : `${profile?.wishlistCount ?? 0} items`} accentColor="#ec4899" />
        <StatCard icon={ShoppingBag} label="Orders" value={ordersLoading ? "…" : `${orders.length} total`} accentColor="#0ea5e9" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs font-bold hover:underline" style={{ color: ORANGE }}>View all →</Link>
        </div>
        {ordersLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-3 py-3">
                <Link href={`/account/orders/${order.id}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:underline">
                  {order.orderNumber}
                </Link>
                <StatusPill status={order.status} />
                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white ml-auto">{formatPrice(order.total, order.currencyCode)}</span>
                <button
                  onClick={() => reorder(order)}
                  disabled={reordering}
                  className="px-3 py-1.5 text-xs font-bold uppercase rounded border disabled:opacity-50"
                  style={{ borderColor: ORANGE, color: ORANGE }}
                >
                  Reorder
                </button>
                <Link href={`/account/orders/${order.id}`} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">→</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── Quick Order ────────────────────────────────────────────

interface QuickOrderRow {
  sku: string;
  quantity: number;
  status: "idle" | "found" | "not-found";
  name?: string;
  price?: number;
}

function QuickOrderTab({ orgId }: { orgId: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const [rows, setRows] = useState<QuickOrderRow[]>([{ sku: "", quantity: 1, status: "idle" }]);
  const [submitting, setSubmitting] = useState(false);

  const updateRow = (i: number, patch: Partial<QuickOrderRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const addRow = () => setRows((r) => [...r, { sku: "", quantity: 1, status: "idle" }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let addedAny = false;
      const nextRows = [...rows];
      for (let i = 0; i < nextRows.length; i++) {
        const row = nextRows[i];
        if (!row.sku.trim()) continue;
        const product = await storefrontFetch<{ id: string; name: string; price: number } | null>(
          orgId,
          `/products/by-sku?sku=${encodeURIComponent(row.sku.trim())}`,
        );
        if (!product) {
          nextRows[i] = { ...row, status: "not-found" };
          continue;
        }
        await addItem(orgId, { productId: product.id, quantity: row.quantity });
        nextRows[i] = { ...row, status: "found", name: product.name, price: product.price };
        addedAny = true;
      }
      setRows(nextRows);
      if (addedAny) {
        openDrawer();
        addToast("Items added to your cart", "success");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quick Order</h1>
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add products by SKU — great for reordering supplies fast.</p>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="SKU"
                value={row.sku}
                onChange={(e) => updateRow(i, { sku: e.target.value, status: "idle" })}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none focus:border-[#e4611e]"
              />
              <input
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => updateRow(i, { quantity: Math.max(1, Number(e.target.value)) })}
                className="w-20 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none"
              />
              {row.status === "found" && <span className="text-xs text-emerald-600 w-32 truncate">{row.name}</span>}
              {row.status === "not-found" && <span className="text-xs text-rose-500 w-32">SKU not found</span>}
              <button onClick={() => removeRow(i)} className="p-2 text-gray-400 hover:text-rose-500" aria-label="Remove row">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="mt-3 flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: ORANGE }}>
          <Plus className="w-3.5 h-3.5" /> Add another line
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-5 w-full sm:w-auto px-6 py-3 text-xs font-bold uppercase tracking-wide text-white rounded disabled:opacity-50"
          style={{ backgroundColor: ORANGE }}
        >
          {submitting ? "Adding…" : "Add to Cart"}
        </button>
      </Card>
    </div>
  );
}

// ── Orders ─────────────────────────────────────────────────

function OrdersTab({ orgId }: { orgId: string }) {
  const { orders, loading } = useAccountOrders(orgId, true);
  const { reorder, reordering } = useReorder(orgId);
  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;
  if (orders.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <Link href={`/account/orders/${order.id}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:underline">
                {order.orderNumber}
              </Link>
              <StatusPill status={order.status} />
              <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white ml-auto">{formatPrice(order.total, order.currencyCode)}</span>
              <button
                onClick={() => reorder(order)}
                disabled={reordering}
                className="px-3 py-1.5 text-xs font-bold uppercase rounded border disabled:opacity-50"
                style={{ borderColor: ORANGE, color: ORANGE }}
              >
                Reorder
              </button>
              <Link href={`/account/orders/${order.id}`} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">→</Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function OrderDetailTab({ orgId, orderId }: { orgId: string; orderId: string }) {
  const { order, loading } = useAccountOrder(orgId, orderId);
  const { reorder, reordering } = useReorder(orgId);
  if (loading || !order) return <p className="text-sm text-gray-400">Loading…</p>;
  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/account/orders" className="text-xs font-semibold hover:underline" style={{ color: ORANGE }}>← Back to orders</Link>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{order.orderNumber}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString()} · <StatusPill status={order.status} />
          </p>
        </div>
        <button
          onClick={() => reorder(order)}
          disabled={reordering}
          className="px-4 py-2 text-xs font-bold uppercase rounded border disabled:opacity-50"
          style={{ borderColor: ORANGE, color: ORANGE }}
        >
          Reorder
        </button>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-3 text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              {item.productName} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.totalPrice, order.currencyCode)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1 text-sm max-w-xs ml-auto">
        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal, order.currencyCode)}</span></div>
        {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-emerald-600">-{formatPrice(order.discountAmount, order.currencyCode)}</span></div>}
        {order.shippingCost > 0 && <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{formatPrice(order.shippingCost, order.currencyCode)}</span></div>}
        <div className="flex justify-between font-bold pt-1 border-t border-gray-100 dark:border-gray-800"><span>Total</span><span>{formatPrice(order.total, order.currencyCode)}</span></div>
      </div>
      {order.timeline && order.timeline.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-3">Order Timeline</h3>
          <ul className="space-y-3">
            {order.timeline.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ORANGE }} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{t.status}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.message} · {new Date(t.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Downloads ──────────────────────────────────────────────

function DownloadsTab({ orgId }: { orgId: string }) {
  const { orders, loading } = useAccountDownloads(orgId, true);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Downloads</h1>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : orders.length === 0 ? (
        <Card><p className="text-sm text-gray-500 dark:text-gray-400">No digital products purchased yet.</p></Card>
      ) : (
        <Card className="p-0 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => (
            <div key={order.id} className="px-5 py-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNumber} <span className="text-xs font-normal text-gray-400">· {new Date(order.createdAt).toLocaleDateString()}</span></p>
              <ul className="mt-2 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.productName}</span>
                    <span className="text-xs text-gray-400">Contact support for your files</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Wishlist ───────────────────────────────────────────────

function WishlistTab({ orgId }: { orgId: string }) {
  const { items, loading, remove } = useWishlist(orgId);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useStorefrontToastStore((s) => s.addToast);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
      {loading && items.length === 0 ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card><p className="text-sm text-gray-500 dark:text-gray-400">Your wishlist is empty — tap the heart icon on any product to save it here.</p></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-3">
              <a href={`/shop/${item.product.slug}`} className="block aspect-square rounded bg-gray-50 dark:bg-[#2a2a2e] overflow-hidden mb-2">
                {item.product.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product.featuredImage} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </a>
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.product.name}</p>
              <p className="text-sm font-bold mt-1" style={{ color: ORANGE }}>{formatPrice(item.product.price)}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={async () => {
                    await addItem(orgId, { productId: item.product.id, quantity: 1 });
                    addToast(`${item.product.name} added to cart`, "success");
                  }}
                  className="flex-1 py-1.5 text-[11px] font-bold uppercase text-white rounded"
                  style={{ backgroundColor: ORANGE }}
                >
                  Add to Cart
                </button>
                <button onClick={() => remove(item.product.id)} className="p-1.5 text-gray-400 hover:text-rose-500" aria-label="Remove from wishlist">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Store Credit ───────────────────────────────────────────

function StoreCreditTab({ orgId }: { orgId: string }) {
  const { profile, loading: profileLoading } = useAccountProfile(orgId, true);
  const { transactions, loading } = useAccountCreditTransactions(orgId, true);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Store Credit</h1>
      <Card>
        <p className="text-xs uppercase tracking-wide text-gray-400">Available Balance</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{profileLoading ? "…" : formatPrice(profile?.storeCredit ?? 0)}</p>
      </Card>
      <Card className="p-0 overflow-hidden">
        <h2 className="px-5 pt-4 pb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">History</h2>
        {loading ? (
          <p className="px-5 pb-4 text-sm text-gray-400">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between items-center px-5 py-3 text-sm">
                <div>
                  <p className="text-gray-900 dark:text-white">{t.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${t.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>
                  {t.type === "credit" ? "+" : "-"}{formatPrice(Math.abs(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── Reward Points ──────────────────────────────────────────

function RewardPointsTab({ orgId }: { orgId: string }) {
  const { profile, loading: profileLoading } = useAccountProfile(orgId, true);
  const { transactions, loading } = useAccountRewardTransactions(orgId, true);
  const points = profile?.rewardPoints ?? 0;
  const tier = rewardTierForPoints(points);
  const { nextTier, remaining } = pointsToNextTier(points);
  const progress = nextTier
    ? Math.min(100, ((points - REWARD_TIER_THRESHOLDS[tier]) / (REWARD_TIER_THRESHOLDS[nextTier] - REWARD_TIER_THRESHOLDS[tier])) * 100)
    : 100;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reward Points</h1>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Your Balance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{profileLoading ? "…" : `${points} pts`}</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: "#a855f71a", color: "#a855f7" }}>
            {tier}
          </span>
        </div>
        {nextTier && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: "#a855f7" }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{remaining} points to {nextTier}</p>
          </div>
        )}
      </Card>
      <Card className="p-0 overflow-hidden">
        <h2 className="px-5 pt-4 pb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">History</h2>
        {loading ? (
          <p className="px-5 pb-4 text-sm text-gray-400">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between items-center px-5 py-3 text-sm">
                <div>
                  <p className="text-gray-900 dark:text-white">{t.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${t.type === "earn" ? "text-emerald-600" : "text-rose-500"}`}>
                  {t.type === "earn" ? "+" : "-"}{Math.abs(t.points)} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────

function ProfileTab({ orgId }: { orgId: string }) {
  const { profile, loading, updateProfile } = useAccountProfile(orgId, true);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setName(profile.name);
    setPhone(profile.phone ?? "");
    setInitialized(true);
  }

  if (loading || !profile) return <p className="text-sm text-gray-400">Loading…</p>;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone });
      addToast("Profile updated", "success");
    } catch {
      addToast("Couldn't update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile Info</h1>
      <Card className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
          <input value={profile.email} disabled className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-gray-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none" />
        </div>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-xs font-bold uppercase text-white rounded disabled:opacity-50" style={{ backgroundColor: ORANGE }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </Card>
    </div>
  );
}

// ── Change Password ────────────────────────────────────────

function ChangePasswordTab({ orgId }: { orgId: string }) {
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await changeAccountPassword(orgId, current, next);
      addToast("Password updated", "success");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Current Password</label>
            <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">New Password</label>
            <input type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none" />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-xs font-bold uppercase text-white rounded disabled:opacity-50" style={{ backgroundColor: ORANGE }}>
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </Card>
    </div>
  );
}

// ── Login Security (stub — no 2FA/session tracking backend exists) ──

function LoginSecurityTab({ orgId }: { orgId: string }) {
  const { profile, loading } = useAccountProfile(orgId, true);
  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Login Security</h1>
      <Card className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Last Login</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
            {loading ? "…" : profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "—"}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          For your security, keep your password up to date.{" "}
          <Link href="/account/change-password" className="font-semibold hover:underline" style={{ color: ORANGE }}>Change password →</Link>
        </p>
      </Card>
    </div>
  );
}

// ── Addresses ──────────────────────────────────────────────

function AddressesTab({ orgId }: { orgId: string }) {
  const { addresses, loading, createAddress, deleteAddress } = useAccountAddresses(orgId, true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", state: "", country: "", zip: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createAddress(form as Omit<AccountAddress, "id">);
      setShowForm(false);
      setForm({ name: "", line1: "", line2: "", city: "", state: "", country: "", zip: "", phone: "" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Addresses</h1>
      {addresses.map((addr) => (
        <Card key={addr.id}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{addr.name}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                {addr.city}, {addr.state} {addr.zip}, {addr.country}
              </p>
            </div>
            <button onClick={() => deleteAddress(addr.id)} className="text-xs text-gray-400 hover:text-rose-500">Delete</button>
          </div>
        </Card>
      ))}

      {showForm ? (
        <Card className="space-y-2">
          {(["name", "line1", "line2", "city", "state", "country", "zip", "phone"] as const).map((field) => (
            <input
              key={field}
              placeholder={field}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none"
            />
          ))}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-xs font-bold uppercase text-white rounded" style={{ backgroundColor: ORANGE }}>
              {saving ? "Saving…" : "Save Address"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold text-gray-500">Cancel</button>
          </div>
        </Card>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs font-semibold hover:underline" style={{ color: ORANGE }}>+ Add new address</button>
      )}
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────

const VALID_TABS = ["dashboard", "quick-order", "orders", "downloads", "wishlist", "store-credit", "reward-points", "profile", "change-password", "login-security", "addresses"];

export default function Account({ orgId, slug }: { orgId: string; slug?: string }) {
  const customer = useCustomerAuthStore((s) => s.customer);
  const logout = useCustomerAuthStore((s) => s.logout);
  const hasHydrated = useCustomerAuthStore((s) => s.hasHydrated);

  // Wait for zustand's persist rehydration before deciding logged-in vs.
  // guest — otherwise every fresh page load flashes the sign-in gate for an
  // instant even for an already-logged-in customer.
  if (!hasHydrated) return null;
  if (!customer) return <AuthGate orgId={orgId} />;

  const [rawTab, subId] = (slug ?? "").split("/");
  const activeTab = VALID_TABS.includes(rawTab) ? rawTab : "dashboard";

  return (
    <section className="py-8 bg-gray-50 dark:bg-[#121214] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-6 items-start">
        <AccountSidebar onLogout={logout} accentColor={ORANGE} />
        <div className="flex-1 min-w-0 w-full">
          {activeTab === "dashboard" && <DashboardTab orgId={orgId} name={customer.name} />}
          {activeTab === "quick-order" && <QuickOrderTab orgId={orgId} />}
          {activeTab === "orders" && (subId ? <OrderDetailTab orgId={orgId} orderId={subId} /> : <OrdersTab orgId={orgId} />)}
          {activeTab === "downloads" && <DownloadsTab orgId={orgId} />}
          {activeTab === "wishlist" && <WishlistTab orgId={orgId} />}
          {activeTab === "store-credit" && <StoreCreditTab orgId={orgId} />}
          {activeTab === "reward-points" && <RewardPointsTab orgId={orgId} />}
          {activeTab === "profile" && <ProfileTab orgId={orgId} />}
          {activeTab === "change-password" && <ChangePasswordTab orgId={orgId} />}
          {activeTab === "login-security" && <LoginSecurityTab orgId={orgId} />}
          {activeTab === "addresses" && <AddressesTab orgId={orgId} />}
        </div>
      </div>
    </section>
  );
}
