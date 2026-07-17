"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/themes/useCart";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/**
 * Always mounted (via StorefrontChrome) so useCart(orgId) keeps the cart
 * synced with the server on every storefront page load — only the visible
 * overlay is conditional on cart.isOpen.
 */
export function MiniCartDrawer({ orgId }: { orgId: string }) {
  const { cart, isOpen, closeDrawer, updateQuantity, removeItem } = useCart(orgId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-[#1c1c1e] z-[301] flex flex-col shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#212529] dark:text-white">
                Your Cart {cart.items.length > 0 && `(${cart.items.reduce((s, i) => s + i.quantity, 0)})`}
              </h2>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  <a
                    href="/shop"
                    onClick={closeDrawer}
                    className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#e4611e] hover:underline"
                  >
                    Continue shopping
                  </a>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex gap-3 p-5">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                        {item.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#212529] dark:text-white truncate">{item.productName}</p>
                        {item.variantLabel && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.variantLabel}</p>
                        )}
                        {!item.available && (
                          <p className="text-xs text-rose-600 mt-0.5">No longer available</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full px-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:text-[#e4611e] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:text-[#e4611e] transition-colors"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= item.availableStock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[#212529] dark:text-white">
                            {formatPrice(item.lineTotal, cart.currencyCode)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-start p-1 text-gray-400 hover:text-rose-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-5 shrink-0 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-bold text-[#212529] dark:text-white">
                    {formatPrice(cart.subtotal, cart.currencyCode)}
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Discount</span>
                    <span className="font-bold text-emerald-600">
                      -{formatPrice(cart.discount, cart.currencyCode)}
                    </span>
                  </div>
                )}
                <a
                  href="/cart"
                  onClick={closeDrawer}
                  className="block w-full text-center py-3 rounded-full border border-[#212529] dark:border-white text-[#212529] dark:text-white text-xs font-bold uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  View Cart
                </a>
                <a
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block w-full text-center py-3 rounded-full bg-[#e4611e] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#c9540f] transition-colors"
                >
                  Checkout
                </a>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
