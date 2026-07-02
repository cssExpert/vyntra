// Product grid is dummy/static for now (see DUMMY_PRODUCTS below) — swap back to
// live API calls once the /products system page is ready. Filters (categories,
// brands, price range) already hit the real public storefront endpoints.

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export type ProductSort = "newest" | "price_asc" | "price_desc";

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  featuredImage: string | null;
  brand: string | null;
  stockStatus: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
}

export interface ProductFacets {
  brands: string[];
  priceRange: { min: number; max: number };
}

export interface ProductListingFilters {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductSort;
}

const PAGE_SIZE = 12;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json() as Promise<T>;
}

const DUMMY_PRODUCTS: PublicProduct[] = [
  { id: "p1", name: "Classic Cotton Crew Tee", slug: "classic-cotton-crew-tee", price: 24.99, compareAtPrice: 34.99, featuredImage: null, brand: "Acme", stockStatus: "in_stock" },
  { id: "p2", name: "Relaxed Fit Denim Jacket", slug: "relaxed-fit-denim-jacket", price: 89.0, compareAtPrice: null, featuredImage: null, brand: "Northwind", stockStatus: "in_stock" },
  { id: "p3", name: "High-Waist Wide Leg Trousers", slug: "high-waist-wide-leg-trousers", price: 54.5, compareAtPrice: 69.0, featuredImage: null, brand: "Contoso", stockStatus: "in_stock" },
  { id: "p4", name: "Everyday Leather Tote", slug: "everyday-leather-tote", price: 129.0, compareAtPrice: null, featuredImage: null, brand: "Acme", stockStatus: "out_of_stock" },
  { id: "p5", name: "Minimalist Wool Overcoat", slug: "minimalist-wool-overcoat", price: 199.0, compareAtPrice: 249.0, featuredImage: null, brand: "Northwind", stockStatus: "in_stock" },
  { id: "p6", name: "Silk Blend Scarf", slug: "silk-blend-scarf", price: 34.0, compareAtPrice: null, featuredImage: null, brand: "Contoso", stockStatus: "in_stock" },
  { id: "p7", name: "Slim Fit Chino Pants", slug: "slim-fit-chino-pants", price: 44.99, compareAtPrice: 59.99, featuredImage: null, brand: "Acme", stockStatus: "in_stock" },
  { id: "p8", name: "Canvas Low-Top Sneakers", slug: "canvas-low-top-sneakers", price: 64.0, compareAtPrice: null, featuredImage: null, brand: "Northwind", stockStatus: "in_stock" },
  { id: "p9", name: "Ribbed Knit Beanie", slug: "ribbed-knit-beanie", price: 18.0, compareAtPrice: 24.0, featuredImage: null, brand: "Contoso", stockStatus: "in_stock" },
  { id: "p10", name: "Oversized Hooded Sweatshirt", slug: "oversized-hooded-sweatshirt", price: 49.0, compareAtPrice: null, featuredImage: null, brand: "Acme", stockStatus: "in_stock" },
  { id: "p11", name: "Polarized Aviator Sunglasses", slug: "polarized-aviator-sunglasses", price: 39.0, compareAtPrice: 55.0, featuredImage: null, brand: "Northwind", stockStatus: "out_of_stock" },
  { id: "p12", name: "Structured Baseball Cap", slug: "structured-baseball-cap", price: 22.0, compareAtPrice: null, featuredImage: null, brand: "Contoso", stockStatus: "in_stock" },
];

/** Category list + brand/price facets for the filter sidebar — live, from the real catalog. */
export function useProductListingFacets(orgId: string) {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [facets, setFacets] = useState<ProductFacets>({ brands: [], priceRange: { min: 0, max: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJson<{ data: PublicCategory[] }>(`${API}/public/sites/${orgId}/categories`),
      getJson<ProductFacets>(`${API}/public/sites/${orgId}/products/facets`),
    ])
      .then(([cats, f]) => {
        if (cancelled) return;
        setCategories(cats.data);
        setFacets(f);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orgId]);

  return { categories, facets, loading };
}

/** Paginated, filtered, sorted product listing for the shop page — static for now. */
export function useProductListing(_orgId: string, filters: ProductListingFilters, page: number) {
  const filtered = DUMMY_PRODUCTS
    .filter((p) => !filters.brand || p.brand === filters.brand)
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.price - b.price;
      if (filters.sort === "price_desc") return b.price - a.price;
      return 0;
    });

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const products = filtered.slice(start, start + PAGE_SIZE);

  return {
    products,
    total,
    loading: false,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
