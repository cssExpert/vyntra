"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/themes/useCart";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";

const ORANGE = "#e4611e";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none focus:border-[#e4611e]";

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
      <section className="py-24 bg-white dark:bg-[#121214] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</p>
        <a href="/shop" className="text-sm underline" style={{ color: ORANGE }}>Continue shopping</a>
      </section>
    );
  }

  return (
    <section className="py-10 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {!customer && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Checking out as a guest.{" "}
                <a href="/account" className="font-semibold hover:underline" style={{ color: ORANGE }}>Sign in</a> if you have an account.
              </p>
            )}

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-3">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputCls} sm:col-span-2`} />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-3">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className={`${inputCls} sm:col-span-2`} />
                <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} className={`${inputCls} sm:col-span-2`} />
                <input required placeholder="City" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className={inputCls} />
                <input required placeholder="State / Province" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} className={inputCls} />
                <input required placeholder="Country" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} className={inputCls} />
                <input required placeholder="ZIP / Postal code" value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Order Summary</h2>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
                      {item.productName} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white shrink-0">{formatPrice(item.lineTotal, cart.currencyCode)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(cart.subtotal, cart.currencyCode)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Discount</span>
                    <span className="font-semibold text-emerald-600">-{formatPrice(cart.discount, cart.currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-1">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(cart.total, cart.currencyCode)}</span>
                </div>
              </div>

              <CouponInput
                couponCode={cart.couponCode}
                discount={cart.discount}
                currencyCode={cart.currencyCode}
                onApply={applyCoupon}
                onRemove={removeCoupon}
                accentColor={ORANGE}
              />

              {error && <p className="text-xs text-rose-500">{error}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-3.5 rounded bg-[#e4611e] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#c9540f] transition-colors disabled:opacity-50"
              >
                {placing ? "Placing Order…" : "Place Order"}
              </button>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">Payment collected on delivery/invoice — no card required at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
