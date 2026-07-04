"use client";

import { useState } from "react";
import {
  useProductListing,
  useProductListingFacets,
  type ProductListingFilters,
  type ProductSort,
  type PublicProduct,
} from "@/lib/themes/useProductListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

const BLUE = "#2563eb";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function ProductCard({ product }: { product: PublicProduct }) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;
  const soldOut = product.stockStatus === "out_of_stock";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {discount !== null && discount > 0 && (
          <span className="absolute top-3 left-3 text-[11px] font-bold px-2 py-1 rounded-full text-white bg-rose-500 shadow-sm">
            {discount}% off
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-600 bg-white px-3 py-1 rounded-full shadow">Sold Out</span>
          </div>
        )}
        <button
          disabled={soldOut}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
          style={{ backgroundColor: BLUE }}
          title="Add to cart"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        {product.brand && <p className="text-[11px] font-medium text-gray-400 mb-0.5">{product.brand}</p>}
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: BLUE }}>${product.price.toFixed(2)}</span>
          {product.compareAtPrice != null && (
            <span className="text-xs text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductListing({ orgId }: { orgId: string }) {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [sort, setSort] = useState<ProductSort>("newest");

  const { categories, facets, pageSize } = useProductListingFacets(orgId);

  const filters: ProductListingFilters = { categoryId, brand, sort };
  const { products, total, loading, loadingMore, hasMore, loadMore } = useProductListing(orgId, filters, pageSize);

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading products…" : `${total} product${total !== 1 ? "s" : ""} available`}
          </p>
        </header>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                !categoryId ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-gray-300"
              }`}
              style={!categoryId ? { backgroundColor: BLUE } : undefined}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  categoryId === c.id ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-gray-300"
                }`}
                style={categoryId === c.id ? { backgroundColor: BLUE } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {facets.brands.length > 0 && (
              <select
                value={brand ?? ""}
                onChange={(e) => setBrand(e.target.value || undefined)}
                className="text-xs font-medium border border-gray-200 rounded-full px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
              >
                <option value="">All Brands</option>
                {facets.brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
              className="text-xs font-medium border border-gray-200 rounded-full px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-200 border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200">
            <EmptyState title="No products found" message="Try a different category, brand, or check back later." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 text-sm font-semibold rounded-full text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: BLUE }}
                >
                  {loadingMore ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
