"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, Trophy, Heart, ShoppingBag, X, Plus } from "lucide-react";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useCartStore } from "@/store/cartStore";
import { LoginForm, RegisterForm } from "@/lib/themes/shared/AuthForms";
import { AccountSidebar } from "@/lib/themes/shared/AccountSidebar";
import { StatCard } from "@/lib/themes/shared/StatCard";
import { StatusPill } from "@/lib/themes/shared/StatusPill";
import { rewardTierForPoints, pointsToNextTier } from "@/lib/themes/shared/rewardTier";
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

const BLUE = "#3b82f6";

function formatPrice(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4" style={{ borderColor: "var(--border, #e5e7eb)" }}>
      {children}
    </div>
  );
}

function AuthGate({ orgId }: { orgId: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-xl font-bold text-center mb-6" style={{ color: "var(--foreground, #111827)" }}>
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>
      {mode === "login" ? <LoginForm orgId={orgId} /> : <RegisterForm orgId={orgId} />}
      <p className="mt-5 text-xs text-center" style={{ color: "var(--muted-foreground, #6b7280)" }}>
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "var(--primary, #3b82f6)" }}>
          {mode === "login" ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

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

function DashboardTab({ orgId, name }: { orgId: string; name: string }) {
  const { profile, loading: profileLoading } = useAccountProfile(orgId, true);
  const { orders, loading: ordersLoading } = useAccountOrders(orgId, true);
  const { reorder, reordering } = useReorder(orgId);
  const recent = orders.slice(0, 4);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Welcome back, {name}</h1>
      <div className="flex flex-wrap gap-3">
        <StatCard icon={Wallet} label="Store Credit" value={profileLoading ? "…" : formatPrice(profile?.storeCredit ?? 0)} accentColor={BLUE} />
        <StatCard icon={Trophy} label="Reward Points" value={profileLoading ? "…" : `${profile?.rewardPoints ?? 0} pts`} accentColor="#a855f7" />
        <StatCard icon={Heart} label="Wishlist" value={profileLoading ? "…" : `${profile?.wishlistCount ?? 0} items`} accentColor="#ec4899" />
        <StatCard icon={ShoppingBag} label="Orders" value={ordersLoading ? "…" : `${orders.length} total`} accentColor="#0ea5e9" />
      </div>
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Recent Orders</h2>
          <Link href="/account/orders" style={{ color: "var(--primary, #3b82f6)" }} className="text-xs">View all →</Link>
        </div>
        {ordersLoading ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>No orders yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            {recent.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <Link href={`/account/orders/${order.id}`} className="font-semibold hover:underline" style={{ color: "var(--foreground, #111827)" }}>{order.orderNumber}</Link>
                <StatusPill status={order.status} />
                <span className="ml-auto font-semibold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(order.total, order.currencyCode)}</span>
                <button onClick={() => reorder(order)} disabled={reordering} className="px-3 py-1 text-xs border rounded" style={{ borderColor: "var(--primary, #3b82f6)", color: "var(--primary, #3b82f6)" }}>
                  Reorder
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

interface QuickOrderRow { sku: string; quantity: number; status: "idle" | "found" | "not-found"; name?: string }

function QuickOrderTab({ orgId }: { orgId: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const [rows, setRows] = useState<QuickOrderRow[]>([{ sku: "", quantity: 1, status: "idle" }]);
  const [submitting, setSubmitting] = useState(false);
  const updateRow = (i: number, patch: Partial<QuickOrderRow>) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let addedAny = false;
      const next = [...rows];
      for (let i = 0; i < next.length; i++) {
        const row = next[i];
        if (!row.sku.trim()) continue;
        const product = await storefrontFetch<{ id: string; name: string } | null>(orgId, `/products/by-sku?sku=${encodeURIComponent(row.sku.trim())}`);
        if (!product) { next[i] = { ...row, status: "not-found" }; continue; }
        await addItem(orgId, { productId: product.id, quantity: row.quantity });
        next[i] = { ...row, status: "found", name: product.name };
        addedAny = true;
      }
      setRows(next);
      if (addedAny) { openDrawer(); addToast("Items added to your cart", "success"); }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Quick Order</h1>
      <Card>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input placeholder="SKU" value={row.sku} onChange={(e) => updateRow(i, { sku: e.target.value, status: "idle" })} className="flex-1 px-3 py-2 text-sm border rounded" style={{ borderColor: "var(--border, #e5e7eb)" }} />
              <input type="number" min={1} value={row.quantity} onChange={(e) => updateRow(i, { quantity: Math.max(1, Number(e.target.value)) })} className="w-16 px-2 py-2 text-sm border rounded" style={{ borderColor: "var(--border, #e5e7eb)" }} />
              {row.status === "found" && <span className="text-xs text-emerald-600 w-24 truncate">{row.name}</span>}
              {row.status === "not-found" && <span className="text-xs text-rose-500 w-24">Not found</span>}
              <button onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} className="p-1 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => setRows((r) => [...r, { sku: "", quantity: 1, status: "idle" }])} className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--primary, #3b82f6)" }}>
          <Plus className="w-3.5 h-3.5" /> Add line
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="mt-4 px-5 py-2.5 text-sm rounded text-white disabled:opacity-50" style={{ backgroundColor: "var(--primary, #3b82f6)" }}>
          {submitting ? "Adding…" : "Add to Cart"}
        </button>
      </Card>
    </div>
  );
}

function OrdersTab({ orgId }: { orgId: string }) {
  const { orders, loading } = useAccountOrders(orgId, true);
  const { reorder, reordering } = useReorder(orgId);
  if (loading) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Orders</h1>
      <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
        {orders.map((order) => (
          <li key={order.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
            <Link href={`/account/orders/${order.id}`} className="font-semibold hover:underline" style={{ color: "var(--foreground, #111827)" }}>{order.orderNumber}</Link>
            <StatusPill status={order.status} />
            <span className="ml-auto font-semibold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(order.total, order.currencyCode)}</span>
            <button onClick={() => reorder(order)} disabled={reordering} className="px-3 py-1 text-xs border rounded" style={{ borderColor: "var(--primary, #3b82f6)", color: "var(--primary, #3b82f6)" }}>Reorder</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderDetailTab({ orgId, orderId }: { orgId: string; orderId: string }) {
  const { order, loading } = useAccountOrder(orgId, orderId);
  const { reorder, reordering } = useReorder(orgId);
  if (loading || !order) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  return (
    <div className="space-y-4 max-w-md text-sm">
      <Link href="/account/orders" style={{ color: "var(--primary, #3b82f6)" }}>← Back to orders</Link>
      <div className="flex justify-between items-center">
        <h2 className="font-bold" style={{ color: "var(--foreground, #111827)" }}>{order.orderNumber}</h2>
        <button onClick={() => reorder(order)} disabled={reordering} className="px-3 py-1 text-xs border rounded" style={{ borderColor: "var(--primary, #3b82f6)", color: "var(--primary, #3b82f6)" }}>Reorder</button>
      </div>
      <StatusPill status={order.status} />
      <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-2">
            <span>{item.productName} × {item.quantity}</span>
            <span>{formatPrice(item.totalPrice, order.currencyCode)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.total, order.currencyCode)}</span></div>
    </div>
  );
}

function DownloadsTab({ orgId }: { orgId: string }) {
  const { orders, loading } = useAccountDownloads(orgId, true);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>My Downloads</h1>
      {loading ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>No digital products purchased yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>{order.orderNumber}</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mt-1">
                <span>{item.productName}</span>
                <span style={{ color: "var(--muted-foreground, #9ca3af)" }} className="text-xs">Contact support for your files</span>
              </div>
            ))}
          </Card>
        ))
      )}
    </div>
  );
}

function WishlistTab({ orgId }: { orgId: string }) {
  const { items, loading, remove } = useWishlist(orgId);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Wishlist</h1>
      {loading && items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <p className="text-sm font-medium line-clamp-2" style={{ color: "var(--foreground, #111827)" }}>{item.product.name}</p>
              <p className="text-sm font-bold mt-1" style={{ color: "var(--primary, #3b82f6)" }}>{formatPrice(item.product.price)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={async () => { await addItem(orgId, { productId: item.product.id, quantity: 1 }); addToast(`${item.product.name} added to cart`, "success"); }} className="flex-1 py-1 text-xs rounded text-white" style={{ backgroundColor: "var(--primary, #3b82f6)" }}>
                  Add to Cart
                </button>
                <button onClick={() => remove(item.product.id)} className="p-1 text-gray-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StoreCreditTab({ orgId }: { orgId: string }) {
  const { profile, loading: profileLoading } = useAccountProfile(orgId, true);
  const { transactions, loading } = useAccountCreditTransactions(orgId, true);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Store Credit</h1>
      <Card>
        <p className="text-xs uppercase" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Available Balance</p>
        <p className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>{profileLoading ? "…" : formatPrice(profile?.storeCredit ?? 0)}</p>
      </Card>
      <Card>
        {loading ? <p className="text-sm">Loading…</p> : transactions.length === 0 ? <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>No transactions yet.</p> : (
          <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between py-2 text-sm">
                <span>{t.reason}</span>
                <span className={t.type === "credit" ? "text-emerald-600" : "text-rose-500"}>{t.type === "credit" ? "+" : "-"}{formatPrice(Math.abs(t.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function RewardPointsTab({ orgId }: { orgId: string }) {
  const { profile, loading: profileLoading } = useAccountProfile(orgId, true);
  const { transactions, loading } = useAccountRewardTransactions(orgId, true);
  const points = profile?.rewardPoints ?? 0;
  const tier = rewardTierForPoints(points);
  const { nextTier, remaining } = pointsToNextTier(points);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Reward Points</h1>
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs uppercase" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Your Balance</p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>{profileLoading ? "…" : `${points} pts`}</p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-bold capitalize" style={{ backgroundColor: "#a855f71a", color: "#a855f7" }}>{tier}</span>
        </div>
        {nextTier && <p className="text-xs mt-2" style={{ color: "var(--muted-foreground, #9ca3af)" }}>{remaining} points to {nextTier}</p>}
      </Card>
      <Card>
        {loading ? <p className="text-sm">Loading…</p> : transactions.length === 0 ? <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>No transactions yet.</p> : (
          <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between py-2 text-sm">
                <span>{t.reason}</span>
                <span className={t.type === "earn" ? "text-emerald-600" : "text-rose-500"}>{t.type === "earn" ? "+" : "-"}{Math.abs(t.points)} pts</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ProfileTab({ orgId }: { orgId: string }) {
  const { profile, loading } = useAccountProfile(orgId, true);
  if (loading || !profile) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  return (
    <div className="space-y-3 max-w-md text-sm">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Profile Info</h1>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Name:</span> <strong>{profile.name}</strong></p>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Email:</span> <strong>{profile.email}</strong></p>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Orders:</span> <strong>{profile.totalOrders}</strong></p>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Reward points:</span> <strong>{profile.rewardPoints}</strong></p>
    </div>
  );
}

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
    if (next !== confirm) { setError("New passwords don't match"); return; }
    setSaving(true);
    try {
      await changeAccountPassword(orgId, current, next);
      addToast("Password updated", "success");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 max-w-md">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Change Password</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="password" required placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className="w-full px-3 py-2 text-sm border rounded" style={{ borderColor: "var(--border, #e5e7eb)" }} />
        <input type="password" required minLength={8} placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} className="w-full px-3 py-2 text-sm border rounded" style={{ borderColor: "var(--border, #e5e7eb)" }} />
        <input type="password" required placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 text-sm border rounded" style={{ borderColor: "var(--border, #e5e7eb)" }} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded text-white disabled:opacity-50" style={{ backgroundColor: "var(--primary, #3b82f6)" }}>
          {saving ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

function LoginSecurityTab({ orgId }: { orgId: string }) {
  const { profile, loading } = useAccountProfile(orgId, true);
  return (
    <div className="space-y-3 max-w-md text-sm">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Login Security</h1>
      <Card>
        <p className="text-xs uppercase" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Last Login</p>
        <p className="font-semibold" style={{ color: "var(--foreground, #111827)" }}>{loading ? "…" : profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "—"}</p>
      </Card>
      <p className="text-xs" style={{ color: "var(--muted-foreground, #6b7280)" }}>
        <Link href="/account/change-password" style={{ color: "var(--primary, #3b82f6)" }}>Change password →</Link>
      </p>
    </div>
  );
}

function AddressesTab({ orgId }: { orgId: string }) {
  const { addresses, loading, createAddress, deleteAddress } = useAccountAddresses(orgId, true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", state: "", country: "", zip: "", phone: "" });
  if (loading) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  return (
    <div className="space-y-3 max-w-md text-sm">
      <h1 className="text-xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Addresses</h1>
      {addresses.map((addr) => (
        <div key={addr.id} className="border rounded p-3" style={{ borderColor: "var(--border, #e5e7eb)" }}>
          <div className="flex justify-between">
            <span>{addr.name} — {addr.line1}, {addr.city}, {addr.state} {addr.zip}</span>
            <button onClick={() => deleteAddress(addr.id)} style={{ color: "var(--muted-foreground, #6b7280)" }}>Delete</button>
          </div>
        </div>
      ))}
      {showForm ? (
        <div className="space-y-2">
          {(["name", "line1", "line2", "city", "state", "country", "zip", "phone"] as const).map((f) => (
            <input key={f} placeholder={f} value={form[f]} onChange={(e) => setForm((s) => ({ ...s, [f]: e.target.value }))} className="w-full px-3 py-2 border rounded" style={{ borderColor: "var(--border, #e5e7eb)" }} />
          ))}
          <button
            onClick={async () => { await createAddress(form as Omit<AccountAddress, "id">); setShowForm(false); }}
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: "var(--primary, #3b82f6)" }}
          >
            Save
          </button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} style={{ color: "var(--primary, #3b82f6)" }}>+ Add address</button>
      )}
    </div>
  );
}

const VALID_TABS = ["dashboard", "quick-order", "orders", "downloads", "wishlist", "store-credit", "reward-points", "profile", "change-password", "login-security", "addresses"];

export default function Account({ orgId, slug }: { orgId: string; slug?: string }) {
  const customer = useCustomerAuthStore((s) => s.customer);
  const logout = useCustomerAuthStore((s) => s.logout);
  const hasHydrated = useCustomerAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) return null;
  if (!customer) return <AuthGate orgId={orgId} />;

  const [rawTab, subId] = (slug ?? "").split("/");
  const activeTab = VALID_TABS.includes(rawTab) ? rawTab : "dashboard";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-6 items-start">
      <AccountSidebar onLogout={logout} accentColor={BLUE} />
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
  );
}
