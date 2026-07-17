import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface PublicProductMedia {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PublicProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
}

export interface PublicProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  specification: string | null;
  price: number;
  compareAtPrice: number | null;
  featuredImage: string | null;
  brand: string | null;
  sku: string | null;
  stock: number;
  stockStatus: string;
  type: string;
  weight: number | null;
  categoryIds: string[];
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  publishedAt: string | null;
  media: PublicProductMedia[];
  variants: PublicProductVariant[];
}

export function useProductDetail(orgId: string, slug: string) {
  const [product, setProduct] = useState<PublicProductDetail | null>(null);
  const [loading, setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetch(`${API}/public/sites/${orgId}/products/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok || r.status === 404) { if (!cancelled) { setNotFound(true); setLoading(false); } return; }
        return r.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setProduct(data);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setNotFound(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [orgId, slug]);

  return { product, loading, notFound };
}
