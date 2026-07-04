import { useEffect, useRef, useState } from "react";

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

const DEFAULT_PAGE_SIZE = 12;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json() as Promise<T>;
}

/** Category list + brand/price facets for the filter sidebar, plus the org's configured page size — live, from the real catalog. */
export function useProductListingFacets(orgId: string) {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [facets, setFacets] = useState<ProductFacets>({ brands: [], priceRange: { min: 0, max: 0 } });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJson<{ data: PublicCategory[] }>(`${API}/public/sites/${orgId}/categories`),
      getJson<ProductFacets>(`${API}/public/sites/${orgId}/products/facets`),
      getJson<{ productsPerPage: number }>(`${API}/public/sites/${orgId}/products/page-settings`),
    ])
      .then(([cats, f, ps]) => {
        if (cancelled) return;
        setCategories(cats.data);
        setFacets(f);
        setPageSize(ps.productsPerPage);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orgId]);

  return { categories, facets, pageSize, loading };
}

/** Filtered, sorted, "load more"-paginated product listing for the shop page — backed by the live catalog (active products only, enforced server-side). */
export function useProductListing(orgId: string, filters: ProductListingFilters, pageSize: number = DEFAULT_PAGE_SIZE) {
  const { categoryId, brand, minPrice, maxPrice, sort } = filters;

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const skipRef = useRef(0);

  function buildQs(skip: number) {
    const qs = new URLSearchParams({ skip: String(skip), take: String(pageSize), sort });
    if (categoryId) qs.set("categoryId", categoryId);
    if (brand) qs.set("brand", brand);
    if (minPrice != null) qs.set("minPrice", String(minPrice));
    if (maxPrice != null) qs.set("maxPrice", String(maxPrice));
    return qs;
  }

  useEffect(() => {
    let cancelled = false;
    skipRef.current = 0;
    setLoading(true);
    getJson<{ data: PublicProduct[]; total: number }>(
      `${API}/public/sites/${orgId}/products?${buildQs(0)}`,
    )
      .then(({ data, total: t }) => {
        if (cancelled) return;
        setProducts(data);
        setTotal(t);
      })
      .catch(() => { if (!cancelled) { setProducts([]); setTotal(0); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, categoryId, brand, minPrice, maxPrice, sort, pageSize]);

  async function loadMore() {
    const nextSkip = skipRef.current + pageSize;
    setLoadingMore(true);
    try {
      const { data, total: t } = await getJson<{ data: PublicProduct[]; total: number }>(
        `${API}/public/sites/${orgId}/products?${buildQs(nextSkip)}`,
      );
      skipRef.current = nextSkip;
      setProducts((prev) => [...prev, ...data]);
      setTotal(t);
    } catch {
      // keep existing products; user can retry via the Load More button
    } finally {
      setLoadingMore(false);
    }
  }

  return {
    products,
    total,
    loading,
    loadingMore,
    hasMore: products.length < total,
    loadMore,
  };
}
