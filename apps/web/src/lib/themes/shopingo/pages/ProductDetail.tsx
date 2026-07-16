"use client";

import { useState } from "react";
import { useProductDetail } from "@/lib/themes/useProductDetail";

const ORANGE = "#e4611e";

function SkeletonDetail() {
  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-4 w-40 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="aspect-square bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
          <div className="space-y-4 pt-2">
            <div className="h-7 w-3/4 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-5 w-1/3 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-4 w-full bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-12 w-48 bg-gray-200 dark:bg-[#2a2a2e] animate-pulse rounded mt-6" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductDetail({
  orgId,
  slug,
}: {
  orgId: string;
  slug?: string;
}) {
  const { product, loading, notFound } = useProductDetail(orgId, slug ?? "");
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specification">("description");

  if (loading) return <SkeletonDetail />;

  if (notFound || !product) {
    return (
      <section className="py-24 bg-white dark:bg-[#121214] min-h-screen flex flex-col items-center justify-center gap-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Product not found</p>
        { }
        <a href="/shop" className="text-sm underline" style={{ color: ORANGE }}>Back to all products</a>
      </section>
    );
  }

  const allImages = product.media.length > 0
    ? product.media.map((m) => ({ url: m.url, alt: m.alt ?? product.name }))
    : product.featuredImage
      ? [{ url: product.featuredImage, alt: product.name }]
      : [];

  const currentImg = allImages[activeImg] ?? null;

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const inStock = product.stockStatus !== "out_of_stock";

  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="hover:text-gray-800 dark:hover:text-gray-200">Home</a>
          <span>/</span>
          { }
          <a href="/shop" className="hover:text-gray-800 dark:hover:text-gray-200">Shop</a>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative overflow-hidden bg-gray-50 dark:bg-[#1c1c1e] aspect-square">
              {currentImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={currentImg.url}
                  src={currentImg.url}
                  alt={currentImg.alt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              {!inStock && (
                <span className="absolute top-3 left-3 text-[11px] font-bold uppercase px-2.5 py-1 text-white bg-gray-500/90 rounded">
                  Sold Out
                </span>
              )}
              {discount !== null && discount > 0 && (
                <span className="absolute top-3 right-3 text-[11px] font-bold uppercase px-2.5 py-1 text-white rounded" style={{ backgroundColor: ORANGE }}>
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all ${
                      activeImg === i ? "border-gray-900 dark:border-gray-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-5 pt-1">
            {product.brand && (
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug text-gray-900 dark:text-gray-100">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
              {product.compareAtPrice != null && (
                <span className="text-xl text-gray-400 dark:text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
              {discount !== null && discount > 0 && (
                <span className="text-sm font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${ORANGE}20`, color: ORANGE }}>
                  {discount}% off
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.stockStatus === "in_stock"
                  ? "In Stock"
                  : product.stockStatus === "low_stock"
                    ? "Low Stock"
                    : product.stockStatus === "backorder"
                      ? "Available on Backorder"
                      : "Out of Stock"}
              </span>
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-400 dark:text-gray-500">SKU: <span className="font-mono">{product.sku}</span></p>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 bg-gray-100 dark:bg-[#2a2a2e] text-gray-600 dark:text-gray-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pt-2">
              <button
                disabled={!inStock}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: inStock ? ORANGE : "#9ca3af" }}
              >
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">Cart & checkout coming soon</p>
            </div>
          </div>
        </div>

        {/* ── Description / Specification tabs ── */}
        {(product.description || product.specification) && (
          <div className="mt-14 border-t border-gray-200 dark:border-gray-800 pt-10">
            {product.description && product.specification ? (
              <>
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                  {(["description", "specification"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div
                  className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: activeTab === "description" ? (product.description ?? "") : (product.specification ?? "") }}
                />
              </>
            ) : (
              <div
                className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description ?? product.specification ?? "" }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
