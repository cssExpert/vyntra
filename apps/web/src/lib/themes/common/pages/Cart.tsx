"use client";

import { useCart } from "@/lib/themes/useCart";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { EmptyState } from "@/lib/themes/shared/EmptyState";
import { ShoppingBag } from "lucide-react";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default function Cart({ orgId }: { orgId: string }) {
  const { cart, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart(orgId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--foreground, #111827)" }}>Your Cart</h1>

      {cart.items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Your cart is empty" message="Browse our shop to find something you like." />
      ) : (
        <div className="space-y-6">
          <ul className="divide-y" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="w-20 h-20 rounded overflow-hidden shrink-0" style={{ background: "var(--muted, #f9fafb)" }}>
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>{item.productName}</p>
                  {item.variantLabel && <p className="text-xs" style={{ color: "var(--muted-foreground, #6b7280)" }}>{item.variantLabel}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 border rounded px-1" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7" aria-label="Decrease">−</button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.availableStock} className="w-7 h-7 disabled:opacity-30" aria-label="Increase">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-xs" style={{ color: "var(--muted-foreground, #6b7280)" }}>Remove</button>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: "var(--foreground, #111827)" }}>
                  {formatPrice(item.lineTotal, cart.currencyCode)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border rounded-lg p-5 space-y-4" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            <div className="space-y-2 text-sm">
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
              <div className="flex justify-between text-base pt-2 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>Total</span>
                <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(cart.total, cart.currencyCode)}</span>
              </div>
            </div>

            <CouponInput couponCode={cart.couponCode} discount={cart.discount} currencyCode={cart.currencyCode} onApply={applyCoupon} onRemove={removeCoupon} />

            <a href="/checkout" className="block w-full text-center py-3 rounded text-sm font-semibold text-white" style={{ backgroundColor: "var(--primary, #3b82f6)" }}>
              Proceed to Checkout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
