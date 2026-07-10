import { useEffect, useState } from "react";
import { storeCategories, type ApiProductCategory } from "@/lib/api";
import type { CategoryGridData, CategoryItem } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
}

function toCategoryItem(c: ApiProductCategory | PublicCategory): CategoryItem {
  return {
    name: c.name,
    image: c.imageUrl ?? "",
    url: `/category/${c.slug}`,
  };
}

/**
 * Resolves the categories to render: always fetches live from the store
 * catalog, limited by the block's configured `limit`.
 *
 * `orgId` distinguishes the two rendering contexts this component is shared
 * across: when set (public storefront), categories come from the
 * unauthenticated `/public/sites/:orgId/categories` endpoint. When absent
 * (CMS editor canvas, where the viewer is already logged in), it uses the
 * authenticated store API scoped to the editor user's own organization.
 */
export function useGridCategories(data: CategoryGridData, orgId?: string) {
  const limit = data.limit ?? 6;

  const [categories, setCategories] = useState<CategoryItem[]>(data.categories ?? []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchCategories = orgId
      ? fetch(`${API}/public/sites/${orgId}/categories`, { cache: "no-store" })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to load categories");
            return res.json() as Promise<{ data: PublicCategory[] }>;
          })
          .then(({ data }) => data.slice(0, limit).map(toCategoryItem))
      : storeCategories
          .list({ take: limit, status: "active" })
          .then((res) => res.data.map(toCategoryItem));

    fetchCategories
      .then((items) => { if (!cancelled) setCategories(items); })
      .catch(() => { if (!cancelled) setCategories([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [orgId, limit]);

  return { categories, loading };
}
