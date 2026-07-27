import { useEffect, useState } from "react";
import { storeProducts, type ApiProduct } from "@/lib/api";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import type { ProductItem, ProductTabsData } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  featuredImage: string | null;
  brand: string | null;
  stockStatus: string;
}

function toProductItem(p: ApiProduct): ProductItem {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.compareAtPrice ?? undefined,
    image: p.featuredImage ?? p.media?.find((m) => m.isPrimary)?.url ?? p.media?.[0]?.url ?? "",
  };
}

function toProductItemPublic(p: PublicProduct): ProductItem {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.compareAtPrice ?? undefined,
    image: p.featuredImage ?? "",
  };
}

/**
 * Resolves the products to render for the active tab: always fetches live
 * from the catalog, optionally filtered/limited by the tab's `source` config.
 *
 * `orgId` distinguishes the two rendering contexts this component is shared
 * across: when set (public storefront), products come from the unauthenticated
 * `/public/sites/:orgId/products` endpoint. When absent (CMS editor canvas,
 * where the viewer is already logged in), it uses the authenticated store API
 * scoped to the editor user's own organization.
 */
export function useActiveTabProducts(
  tabs: ProductTabsData["tabs"],
  activeIndex: number,
  orgId?: string,
) {
  const tab = tabs[activeIndex];
  const source = tab?.source;
  const categoryId = source?.categoryId;
  const productType = source?.productType;
  const limit = source?.limit ?? 8;

  const [products, setProducts] = useState<ProductItem[]>(tab?.products ?? []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchProducts = orgId
      ? (async () => {
          const qs = new URLSearchParams({ take: String(limit) });
          if (categoryId) qs.set("categoryId", categoryId);
          if (productType) qs.set("type", productType);
          const accessToken = useCustomerAuthStore.getState().accessToken;
          const res = await fetch(`${API}/public/sites/${orgId}/products?${qs}`, {
            cache: "no-store",
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          });
          if (!res.ok) throw new Error("Failed to load products");
          const { data } = (await res.json()) as { data: PublicProduct[] };
          return data.map(toProductItemPublic);
        })()
      : storeProducts
          .list({ take: limit, status: "active", categoryId, type: productType })
          .then((res) => res.data.map(toProductItem));

    fetchProducts
      .then((items) => { if (!cancelled) setProducts(items); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
     
  }, [activeIndex, categoryId, productType, limit, orgId]);

  return { products, loading };
}
