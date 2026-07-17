"use client";

import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/themes/useCart";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

const ORANGE = "#e4611e";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default function Cart({ orgId }: { orgId: string }) {
  const { cart, loading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart(orgId);

  return (
    <section className="py-10 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Your Cart
        </h1>

        {cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            message="Browse our shop to find something you like."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5">
                  <a href={item.productSlug ? `/shop/${item.productSlug}` : "/shop"} className="w-24 h-24 rounded bg-gray-50 dark:bg-[#1c1c1e] shrink-0 overflow-hidden">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </a>
                  <div className="flex-1 min-w-0">
                    <a href={item.productSlug ? `/shop/${item.productSlug}` : "/shop"} className="text-sm font-semibold text-gray-900 dark:text-white hover:underline">
                      {item.productName}
                    </a>
                    {item.variantLabel && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.variantLabel}</p>}
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatPrice(item.unitPrice, cart.currencyCode)}</p>
                    {item.priceChanged && (
                      <p className="text-xs text-amber-600 mt-1">Price updated since you added this item</p>
                    )}
                    {!item.available && <p className="text-xs text-rose-600 mt-1">No longer available</p>}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-full px-2">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:text-[#e4611e]" aria-label="Decrease quantity">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          className="p-1.5 hover:text-[#e4611e] disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-xs font-semibold text-gray-400 hover:text-rose-500 flex items-center gap-1 transition-colors">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(item.lineTotal, cart.currencyCode)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Order Summary</h2>
                <div className="space-y-2 text-sm">
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
                  <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-base">
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

                <a
                  href="/checkout"
                  className="block w-full text-center py-3.5 rounded bg-[#e4611e] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#c9540f] transition-colors"
                >
                  Proceed to Checkout
                </a>
                <a href="/shop" className="block text-center text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        )}
        {loading && <p className="text-xs text-gray-400 mt-4">Syncing cart…</p>}
      </div>
    </section>
  );
}
