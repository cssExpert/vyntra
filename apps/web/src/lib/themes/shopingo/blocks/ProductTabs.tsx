"use client";

import { useState } from "react";
import type { ProductTabsData, ProductItem } from "@/lib/themes/types";
import { useActiveTabProducts } from "@/lib/themes/useProductTabs";
import { EmptyState } from "@/lib/themes/shared/EmptyState";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";
import { ApiError } from "@/lib/storefrontApi";

const ORANGE = "#e4611e";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? ORANGE : "none"} stroke={ORANGE} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product, orgId }: { product: ProductItem; orgId?: string }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const isSaved = useWishlistStore((s) => s.isSaved(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isLoggedIn = useCustomerAuthStore((s) => !!s.customer);
  const openAuthModal = useCustomerAuthStore((s) => s.openAuthModal);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!orgId || adding) return;
    setAdding(true);
    try {
      await addItem(orgId, { productId: product.id, quantity: 1 });
      addToast(`${product.name} added to cart`, "success");
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Couldn't add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!orgId) return;
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }
    try {
      await toggleWishlist(orgId, product.id);
      addToast(isSaved ? "Removed from wishlist" : "Added to wishlist", "success");
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Couldn't update wishlist", "error");
    }
  };

  return (
    <div className="group bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 rounded overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden bg-gray-50 dark:bg-[#2a2a2e] aspect-square">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 text-white rounded bg-[#e4611e]">
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 text-white rounded bg-red-500">
            -{discount}%
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 py-2 text-xs font-semibold text-white bg-[#e4611e] transition-opacity hover:opacity-85 disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
          <button
            onClick={handleToggleWishlist}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-9 h-8 flex items-center justify-center bg-white dark:bg-[#2a2a2e] border border-gray-200 dark:border-gray-600 transition-colors ${isSaved ? "text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-500"}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">{product.name}</p>
        {product.rating != null && <StarRating rating={product.rating} />}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-[#e4611e]">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductTabs({ data, orgId }: { data: ProductTabsData; orgId?: string }) {
  const [active, setActive] = useState(0);
  const { products, loading } = useActiveTabProducts(data.tabs, active, orgId);
  if (!data.tabs.length) return null;

  return (
    <section className="py-14 bg-white dark:bg-[#121214]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap gap-0 mb-8 border-b border-gray-200 dark:border-gray-700">
          {data.tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                i === active
                  ? "border-[#e4611e] text-[#e4611e]"
                  : "border-transparent text-[#4a4a4a] dark:text-gray-400 hover:text-[#e4611e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">Loading products…</p>
        ) : products.length === 0 ? (
          <EmptyState title="No products found" message="Try a different category or product type." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} orgId={orgId} />)}
          </div>
        )}
      </div>
    </section>
  );
}
