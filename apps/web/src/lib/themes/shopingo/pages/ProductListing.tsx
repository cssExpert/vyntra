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

const ORANGE = "#e4611e";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "What's New" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function GridCard({ product }: { product: PublicProduct }) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group">
      <div className="relative overflow-hidden bg-gray-50 dark:bg-[#2a2a2e] aspect-[3/4] mb-4">
        {product.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {product.stockStatus === "out_of_stock" && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 text-white rounded bg-gray-500/90">
            Sold Out
          </span>
        )}
      </div>
      {product.brand && (
        <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{product.brand}</h3>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 line-clamp-2">{product.name}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
        <span className="font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
        {product.compareAtPrice != null && (
          <span className="text-gray-400 dark:text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
        )}
        {discount !== null && discount > 0 && (
          <span className="font-medium" style={{ color: ORANGE }}>({discount}% off)</span>
        )}
      </div>
    </div>
  );
}

function ListCard({ product }: { product: PublicProduct }) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="flex gap-4 sm:gap-5 py-5 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="relative overflow-hidden bg-gray-50 dark:bg-[#2a2a2e] w-24 h-32 sm:w-32 sm:h-40 md:w-40 md:h-48 shrink-0">
        {product.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {product.stockStatus === "out_of_stock" && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 text-white rounded bg-gray-500/90">
            Sold Out
          </span>
        )}
      </div>
      <div className="min-w-0">
        {product.brand && <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{product.brand}</h3>}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{product.name}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
          {product.compareAtPrice != null && (
            <span className="text-gray-400 dark:text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
          {discount !== null && discount > 0 && (
            <span className="font-medium" style={{ color: ORANGE }}>({discount}% off)</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <li>
      <label className="flex items-center justify-between gap-2 cursor-pointer group">
        <span className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 rounded-sm accent-[#e4611e]"
          />
          <span className={`text-sm transition-colors ${checked ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}`}>
            {label}
          </span>
        </span>
        {count != null && <span className="text-xs text-gray-400 dark:text-gray-500">({count})</span>}
      </label>
    </li>
  );
}

export default function ProductListing({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [sort, setSort] = useState<ProductSort>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { categories, facets, loading: facetsLoading } = useProductListingFacets(orgId);

  const filters: ProductListingFilters = {
    categoryId,
    brand,
    maxPrice: priceMax,
    sort,
  };
  const { products, total, loading, pageCount } = useProductListing(orgId, filters, page);

  function resetPage() {
    setPage(1);
  }

  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          <a href="/" className="hover:text-gray-800 dark:hover:text-gray-200">Home</a>
          <span className="mx-1.5">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Products</span>
        </nav>

        {/* Mobile/tablet filter toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="lg:hidden w-full flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100"
        >
          <span className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
            Filters
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className={`w-full lg:w-72 shrink-0 ${filtersOpen ? "block" : "hidden"} lg:block`}>
            <div className="border border-gray-200 dark:border-gray-700">
              <h2 className="hidden lg:block text-lg font-bold text-gray-900 dark:text-gray-100 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                Filters
              </h2>

              {facetsLoading ? (
                <div className="px-5 py-4 space-y-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 w-4/5 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded-sm" />
                  ))}
                </div>
              ) : (
                <>
                  {categories.length > 0 && (
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Categories</h3>
                      <ul className="space-y-2.5">
                        {categories.map((c) => (
                          <CheckboxRow
                            key={c.id}
                            label={c.name}
                            checked={categoryId === c.id}
                            onChange={() => { setCategoryId(categoryId === c.id ? undefined : c.id); resetPage(); }}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {facets.brands.length > 0 && (
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Brands</h3>
                      <ul className="space-y-2.5">
                        {facets.brands.map((b) => (
                          <CheckboxRow
                            key={b}
                            label={b}
                            checked={brand === b}
                            onChange={() => { setBrand(brand === b ? undefined : b); resetPage(); }}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {!facetsLoading && facets.priceRange.max > 0 && (
                <div className="px-5 py-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Price Range</h3>
                  <input
                    type="range"
                    min={facets.priceRange.min}
                    max={facets.priceRange.max}
                    value={priceMax ?? facets.priceRange.max}
                    onChange={(e) => { setPriceMax(Number(e.target.value)); resetPage(); }}
                    className="w-full accent-[#e4611e]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>${facets.priceRange.min.toFixed(0)}</span>
                    <span>${(priceMax ?? facets.priceRange.max).toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {loading ? "Loading…" : (
                  <>
                    <span className="font-bold text-gray-900 dark:text-white">{total}</span> Item{total !== 1 ? "s" : ""} Found
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Grid</span>
                  <button
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                    className={`w-9 h-9 flex items-center justify-center border transition-colors ${view === "grid" ? "text-white border-transparent" : "text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-600"}`}
                    style={view === "grid" ? { backgroundColor: "#212529" } : undefined}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="5" height="18" /><rect x="10" y="3" width="5" height="18" /><rect x="18" y="3" width="4" height="18" /></svg>
                  </button>
                  <button
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                    className={`w-9 h-9 flex items-center justify-center border transition-colors ${view === "list" ? "text-white border-transparent" : "text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-600"}`}
                    style={view === "list" ? { backgroundColor: "#212529" } : undefined}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="3" /><rect x="2" y="10.5" width="20" height="3" /><rect x="2" y="17" width="20" height="3" /></svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sort By</span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as ProductSort); resetPage(); }}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 bg-white dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-200 dark:bg-[#2a2a2e] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState title="No products found" message="Try clearing a filter or checking back later." />
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
                {products.map((p) => <GridCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div>
                {products.map((p) => <ListCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && pageCount > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:border-gray-400"
                >
                  Previous
                </button>
                {Array.from({ length: pageCount }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className="w-8 h-8 text-sm rounded font-semibold transition-colors"
                      style={
                        n === page
                          ? { backgroundColor: ORANGE, color: "white" }
                          : undefined
                      }
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:border-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
