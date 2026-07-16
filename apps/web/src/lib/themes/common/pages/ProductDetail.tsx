"use client";

import { useProductDetail } from "@/lib/themes/useProductDetail";

export default function ProductDetail({ orgId, slug }: { orgId: string; slug?: string }) {
  const { product, loading, notFound } = useProductDetail(orgId, slug ?? "");

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

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
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
            <span className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>${product.price.toFixed(2)}</span>
            {product.compareAtPrice != null && (
              <span className="text-base line-through" style={{ color: "var(--muted-foreground, #9ca3af)" }}>${product.compareAtPrice.toFixed(2)}</span>
            )}
            {discount !== null && discount > 0 && (
              <span className="text-sm font-medium" style={{ color: "var(--primary, #3b82f6)" }}>{discount}% off</span>
            )}
          </div>
          {product.shortDescription && (
            <p className="leading-relaxed" style={{ color: "var(--muted-foreground, #6b7280)" }}>{product.shortDescription}</p>
          )}
          <p className="text-sm" style={{ color: product.stockStatus === "out_of_stock" ? "var(--destructive, #ef4444)" : "var(--muted-foreground, #22c55e)" }}>
            {product.stockStatus === "out_of_stock" ? "Out of Stock" : "In Stock"}
          </p>
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
