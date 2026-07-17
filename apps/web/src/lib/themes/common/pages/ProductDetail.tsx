"use client";

import { useMemo, useState } from "react";
import { useProductDetail } from "@/lib/themes/useProductDetail";
import { useCartStore } from "@/store/cartStore";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";
import { ApiError } from "@/lib/storefrontApi";

export default function ProductDetail({ orgId, slug }: { orgId: string; slug?: string }) {
  const { product, loading, notFound } = useProductDetail(orgId, slug ?? "");
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const attributeOptions = useMemo(() => {
    if (!product) return {};
    const options: Record<string, Set<string>> = {};
    for (const variant of product.variants) {
      for (const [key, value] of Object.entries(variant.attributes)) {
        if (!options[key]) options[key] = new Set();
        options[key].add(value);
      }
    }
    return Object.fromEntries(Object.entries(options).map(([k, v]) => [k, Array.from(v)]));
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="h-6 w-32 bg-gray-100 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 animate-pulse rounded" />
          <div className="space-y-3">
            <div className="h-7 w-3/4 bg-gray-100 animate-pulse rounded" />
            <div className="h-5 w-1/3 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-xl font-semibold mb-4" style={{ color: "var(--foreground, #111827)" }}>Product not found</p>
        { }
        <a href="/shop" style={{ color: "var(--primary, #3b82f6)" }}>← Back to products</a>
      </div>
    );
  }

  const hasVariants = product.variants.length > 0;
  const attributeKeys = Object.keys(attributeOptions);
  const allAttrsSelected = attributeKeys.every((k) => selectedAttrs[k]);
  const selectedVariant = hasVariants && allAttrsSelected
    ? (product.variants.find((v) => attributeKeys.every((k) => v.attributes[k] === selectedAttrs[k])) ?? null)
    : null;

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const inStock = hasVariants ? (selectedVariant ? selectedVariant.stock > 0 : true) : product.stockStatus !== "out_of_stock";
  const canAddToCart = inStock && (!hasVariants || !!selectedVariant) && displayStock > 0;

  const handleAddToCart = async () => {
    if (!canAddToCart) return;
    setAdding(true);
    try {
      await addItem(orgId, { productId: product.id, variantId: selectedVariant?.id, quantity });
      addToast(`${product.name} added to cart`, "success");
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Couldn't add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const discount = displayCompareAt
    ? Math.round(((displayCompareAt - displayPrice) / displayCompareAt) * 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8 flex gap-2" style={{ color: "var(--muted-foreground, #6b7280)" }}>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="hover:underline">Home</a>
        <span>/</span>
        { }
        <a href="/shop" className="hover:underline">Shop</a>
        <span>/</span>
        <span style={{ color: "var(--foreground, #111827)" }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="aspect-square overflow-hidden rounded-lg" style={{ background: "var(--muted, #f9fafb)" }}>
          {product.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.featuredImage} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--muted-foreground, #d1d5db)" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {product.brand && <p className="text-sm font-medium" style={{ color: "var(--muted-foreground, #6b7280)" }}>{product.brand}</p>}
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>{product.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>${displayPrice.toFixed(2)}</span>
            {displayCompareAt != null && (
              <span className="text-base line-through" style={{ color: "var(--muted-foreground, #9ca3af)" }}>${displayCompareAt.toFixed(2)}</span>
            )}
            {discount !== null && discount > 0 && (
              <span className="text-sm font-medium" style={{ color: "var(--primary, #3b82f6)" }}>{discount}% off</span>
            )}
          </div>
          {product.shortDescription && (
            <p className="leading-relaxed" style={{ color: "var(--muted-foreground, #6b7280)" }}>{product.shortDescription}</p>
          )}
          <p className="text-sm" style={{ color: !inStock ? "var(--destructive, #ef4444)" : "var(--muted-foreground, #22c55e)" }}>
            {hasVariants && !selectedVariant ? "Select options to check availability" : !inStock ? "Out of Stock" : "In Stock"}
          </p>

          {attributeKeys.length > 0 && (
            <div className="space-y-3">
              {attributeKeys.map((key) => (
                <div key={key}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--muted-foreground, #6b7280)" }}>{key}</p>
                  <div className="flex flex-wrap gap-2">
                    {attributeOptions[key].map((value) => {
                      const isSelected = selectedAttrs[key] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setSelectedAttrs((prev) => ({ ...prev, [key]: value }))}
                          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors"
                          style={
                            isSelected
                              ? { backgroundColor: "var(--primary, #3b82f6)", borderColor: "var(--primary, #3b82f6)", color: "#fff" }
                              : { borderColor: "var(--border, #e5e7eb)", color: "var(--foreground, #374151)" }
                          }
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-3 border rounded px-1" style={{ borderColor: "var(--border, #e5e7eb)" }}>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8" aria-label="Decrease quantity">−</button>
              <span className="text-sm font-semibold w-5 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(displayStock || 99, q + 1))} className="w-8 h-8" aria-label="Increase quantity">+</button>
            </div>
            <button
              disabled={!canAddToCart || adding}
              onClick={handleAddToCart}
              className="flex-1 py-3 text-sm font-semibold rounded disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--primary, #3b82f6)", color: "#fff" }}
            >
              {!inStock ? "Out of Stock" : hasVariants && !selectedVariant ? "Select Options" : adding ? "Adding…" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {product.description && (
        <div className="mt-12 border-t pt-10" style={{ borderColor: "var(--border, #e5e7eb)" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground, #111827)" }}>Description</h2>
          <div
            className="prose max-w-none"
            style={{ color: "var(--foreground, #374151)" }}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}
