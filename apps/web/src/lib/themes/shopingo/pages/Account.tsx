"use client";

import { useState } from "react";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { LoginForm, RegisterForm } from "@/lib/themes/shared/AuthForms";
import { useAccountProfile, useAccountOrders, useAccountOrder, useAccountAddresses, type AccountAddress } from "@/lib/themes/useAccount";

const ORANGE = "#e4611e";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

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

function ProfileTab({ orgId }: { orgId: string }) {
  const { profile, loading } = useAccountProfile(orgId, true);
  if (loading || !profile) return <p className="text-sm text-gray-400">Loading…</p>;
  return (
    <div className="space-y-4 max-w-md">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.name}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.email}</p>
      </div>
      {profile.phone && (
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.phone}</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="border border-gray-200 dark:border-gray-800 rounded p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.totalOrders}</p>
          <p className="text-[11px] text-gray-500">Orders</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.rewardPoints}</p>
          <p className="text-[11px] text-gray-500">Points</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">${profile.storeCredit.toFixed(0)}</p>
          <p className="text-[11px] text-gray-500">Credit</p>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orgId }: { orgId: string }) {
  const { orders, loading } = useAccountOrders(orgId, true);
  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;
  if (orders.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>;
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
      {orders.map((order) => (
        <a key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between py-4 hover:bg-gray-50 dark:hover:bg-white/5 px-2 -mx-2 transition-colors">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.total, order.currencyCode)}</p>
            <p className="text-[11px] uppercase font-semibold text-gray-500 mt-0.5">{order.status}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function OrderDetailTab({ orgId, orderId }: { orgId: string; orderId: string }) {
  const { order, loading } = useAccountOrder(orgId, orderId);
  if (loading || !order) return <p className="text-sm text-gray-400">Loading…</p>;
  return (
    <div className="space-y-6 max-w-2xl">
      <a href="/account/orders" className="text-xs font-semibold hover:underline" style={{ color: ORANGE }}>← Back to orders</a>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{order.orderNumber}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Placed {new Date(order.createdAt).toLocaleDateString()} · Status: <span className="font-semibold uppercase">{order.status}</span>
        </p>
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
    </div>
  );
}

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
      {addresses.map((addr) => (
        <div key={addr.id} className="border border-gray-200 dark:border-gray-800 rounded p-4 text-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{addr.name}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                {addr.city}, {addr.state} {addr.zip}, {addr.country}
              </p>
            </div>
            <button onClick={() => deleteAddress(addr.id)} className="text-xs text-gray-400 hover:text-rose-500">Delete</button>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded p-4 space-y-2">
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
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs font-semibold hover:underline" style={{ color: ORANGE }}>+ Add new address</button>
      )}
    </div>
  );
}

export default function Account({ orgId, slug }: { orgId: string; slug?: string }) {
  const customer = useCustomerAuthStore((s) => s.customer);
  const logout = useCustomerAuthStore((s) => s.logout);

  if (!customer) return <AuthGate orgId={orgId} />;

  const [tab, subId] = (slug ?? "").split("/");
  const activeTab = tab === "orders" || tab === "addresses" ? tab : "profile";

  const tabs = [
    { key: "profile", label: "Profile", href: "/account" },
    { key: "orders", label: "Orders", href: "/account/orders" },
    { key: "addresses", label: "Addresses", href: "/account/addresses" },
  ] as const;

  return (
    <section className="py-10 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8" style={{ fontFamily: "'Raleway', sans-serif" }}>
          My Account
        </h1>

        <div className="flex gap-6 border-b border-gray-100 dark:border-gray-800 mb-8">
          {tabs.map((t) => (
            <a
              key={t.key}
              href={t.href}
              className={`pb-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                activeTab === t.key ? "border-[#e4611e] text-[#e4611e]" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {t.label}
            </a>
          ))}
          <button onClick={logout} className="pb-3 -mb-px text-sm font-semibold text-gray-400 hover:text-rose-500 transition-colors ml-auto">
            Logout
          </button>
        </div>

        {activeTab === "profile" && <ProfileTab orgId={orgId} />}
        {activeTab === "orders" && (subId ? <OrderDetailTab orgId={orgId} orderId={subId} /> : <OrdersTab orgId={orgId} />)}
        {activeTab === "addresses" && <AddressesTab orgId={orgId} />}
      </div>
    </section>
  );
}
