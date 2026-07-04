import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface PublicBlogDetailPost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  body: string | null;
  excerpt: string | null;
  coverImage: string | null;
  author: string | null;
  category: string | null;
  seoTitle: string | null;
  metaDesc: string | null;
  keywords: string | null;
  publishedAt: string | null;
  isFeatured: boolean;
  allowComments: boolean;
  tags: string[];
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

/** A single published post for the /blog/[slug] page — live, from the real catalog. */
export function useBlogDetail(orgId: string, slug: string) {
  const [post, setPost] = useState<PublicBlogDetailPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getJson<PublicBlogDetailPost>(`${API}/public/sites/${orgId}/blogs/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (cancelled) return;
        if (!data) setNotFound(true);
        setPost(data);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orgId, slug]);

  return { post, loading, notFound };
}
