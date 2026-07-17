"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/themes/useCart";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

const inputCls = "w-full px-3.5 py-2.5 text-sm border rounded outline-none";
const inputStyle = { borderColor: "var(--border, #e5e7eb)" };

interface CheckoutOrderResponse {
  order: { id: string; orderNumber: string };
  session?: { customer: { id: string; name: string; email: string; phone: string | null }; accessToken: string; refreshToken: string };
}

export default function Checkout({ orgId }: { orgId: string }) {
  const router = useRouter();
  const { cart, applyCoupon, removeCoupon } = useCart(orgId);
  const customer = useCustomerAuthStore((s) => s.customer);
  const adoptSession = useCustomerAuthStore((s) => s.adoptSession);
  const addToast = useStorefrontToastStore((s) => s.addToast);

  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", country: "", zip: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setError(null);
    setPlacing(true);
    try {
      const res = await storefrontFetch<CheckoutOrderResponse>(orgId, "/checkout", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          shippingAddress: { name, ...address, phone: phone || undefined },
        }),
      });
      if (res.session) adoptSession(orgId, res.session);
      addToast("Order placed successfully!", "success");
      router.push(`/account/orders/${res.order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't place your order — please try again");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-lg font-semibold mb-4" style={{ color: "var(--foreground, #111827)" }}>Your cart is empty</p>
        <a href="/shop" style={{ color: "var(--primary, #3b82f6)" }}>Continue shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--foreground, #111827)" }}>Checkout</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="space-y-6">
          {!customer && (
            <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>
              Checking out as a guest. <a href="/account" style={{ color: "var(--primary, #3b82f6)" }}>Sign in</a> if you have an account.
            </p>
          )}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Contact</h2>
            <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} />
            <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={inputStyle} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Shipping Address</h2>
            <input required placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className={inputCls} style={inputStyle} />
            <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} className={inputCls} style={inputStyle} />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="City" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="State" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="Country" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} className={inputCls} style={inputStyle} />
              <input required placeholder="ZIP" value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-5 space-y-4 h-fit" style={{ borderColor: "var(--border, #e5e7eb)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Order Summary</h2>
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm gap-2">
                <span className="line-clamp-1" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-semibold shrink-0" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(item.lineTotal, cart.currencyCode)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm pt-2 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-foreground, #6b7280)" }}>Subtotal</span>
              <span className="font-semibold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(cart.subtotal, cart.currencyCode)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-foreground, #6b7280)" }}>Discount</span>
                <span className="font-semibold text-emerald-600">-{formatPrice(cart.discount, cart.currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between text-base">
              <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>Total</span>
              <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(cart.total, cart.currencyCode)}</span>
            </div>
          </div>

          <CouponInput couponCode={cart.couponCode} discount={cart.discount} currencyCode={cart.currencyCode} onApply={applyCoupon} onRemove={removeCoupon} />

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full py-3 rounded text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--primary, #3b82f6)" }}
          >
            {placing ? "Placing Order…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
