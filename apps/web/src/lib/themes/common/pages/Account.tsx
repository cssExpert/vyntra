"use client";

import { useState } from "react";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { LoginForm, RegisterForm } from "@/lib/themes/shared/AuthForms";
import { useAccountProfile, useAccountOrders, useAccountOrder, useAccountAddresses, type AccountAddress } from "@/lib/themes/useAccount";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
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

function ProfileTab({ orgId }: { orgId: string }) {
  const { profile, loading } = useAccountProfile(orgId, true);
  if (loading || !profile) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  return (
    <div className="space-y-3 max-w-md text-sm">
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Name:</span> <strong>{profile.name}</strong></p>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Email:</span> <strong>{profile.email}</strong></p>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Orders:</span> <strong>{profile.totalOrders}</strong></p>
      <p><span style={{ color: "var(--muted-foreground, #6b7280)" }}>Reward points:</span> <strong>{profile.rewardPoints}</strong></p>
    </div>
  );
}

function OrdersTab({ orgId }: { orgId: string }) {
  const { orders, loading } = useAccountOrders(orgId, true);
  if (loading) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  if (orders.length === 0) return <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>No orders yet.</p>;
  return (
    <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
      {orders.map((order) => (
        <li key={order.id}>
          <a href={`/account/orders/${order.id}`} className="flex justify-between py-3 text-sm hover:opacity-70">
            <span style={{ color: "var(--foreground, #111827)" }}>{order.orderNumber}</span>
            <span style={{ color: "var(--muted-foreground, #6b7280)" }}>{formatPrice(order.total, order.currencyCode)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function OrderDetailTab({ orgId, orderId }: { orgId: string; orderId: string }) {
  const { order, loading } = useAccountOrder(orgId, orderId);
  if (loading || !order) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;
  return (
    <div className="space-y-4 max-w-md text-sm">
      <a href="/account/orders" style={{ color: "var(--primary, #3b82f6)" }}>← Back to orders</a>
      <h2 className="font-bold" style={{ color: "var(--foreground, #111827)" }}>{order.orderNumber}</h2>
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

function AddressesTab({ orgId }: { orgId: string }) {
  const { addresses, loading, createAddress, deleteAddress } = useAccountAddresses(orgId, true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", line1: "", line2: "", city: "", state: "", country: "", zip: "", phone: "" });

  if (loading) return <p className="text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Loading…</p>;

  return (
    <div className="space-y-3 max-w-md text-sm">
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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--foreground, #111827)" }}>My Account</h1>
      <div className="flex gap-6 border-b mb-6" style={{ borderColor: "var(--border, #e5e7eb)" }}>
        {tabs.map((t) => (
          <a key={t.key} href={t.href} className="pb-2 text-sm" style={{ color: activeTab === t.key ? "var(--primary, #3b82f6)" : "var(--muted-foreground, #6b7280)" }}>
            {t.label}
          </a>
        ))}
        <button onClick={logout} className="pb-2 text-sm ml-auto" style={{ color: "var(--muted-foreground, #6b7280)" }}>Logout</button>
      </div>
      {activeTab === "profile" && <ProfileTab orgId={orgId} />}
      {activeTab === "orders" && (subId ? <OrderDetailTab orgId={orgId} orderId={subId} /> : <OrdersTab orgId={orgId} />)}
      {activeTab === "addresses" && <AddressesTab orgId={orgId} />}
    </div>
  );
}
