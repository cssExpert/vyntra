import { useEffect, useState } from "react";
import { cmsBlogs, type CmsBlogListItem } from "@/lib/api";
import type { BlogPost, BlogSectionData } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string | null;
  category: string | null;
  publishedAt: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toBlogPost(p: PublicBlogPost | CmsBlogListItem): BlogPost {
  return {
    id: p.id,
    title: p.title,
    excerpt: ("excerpt" in p && p.excerpt) || "",
    image: ("coverImage" in p && p.coverImage) || "",
    author: p.author || "Admin",
    date: formatDate(p.publishedAt),
    slug: p.slug,
  };
}

/**
 * Resolves the posts to render for a Blog Section block: always fetches
 * live from the blog, filtered/sorted/limited by the block's `source` config.
 *
 * `orgId` distinguishes the two rendering contexts this component is shared
 * across: when set (public storefront), posts come from the unauthenticated
 * `/public/sites/:orgId/blogs` endpoint. When absent (CMS editor canvas,
 * where the viewer is already logged in), it uses the authenticated CMS API
 * scoped to the editor user's own organization.
 */
export function useBlogPosts(data: BlogSectionData, orgId?: string) {
  const source = data.source;
  const category = source?.category;
  const sort = source?.sort ?? "newest";
  const limit = source?.limit ?? 12;

  const [posts, setPosts] = useState<BlogPost[]>(data.posts ?? []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchPosts = orgId
      ? (async () => {
          const qs = new URLSearchParams({ take: String(limit), sort });
          if (category) qs.set("category", category);
          const res = await fetch(`${API}/public/sites/${orgId}/blogs?${qs}`, {
            cache: "no-store",
          });
          if (!res.ok) throw new Error("Failed to load posts");
          const { data } = (await res.json()) as { data: PublicBlogPost[] };
          return data.map(toBlogPost);
        })()
      : cmsBlogs
          .list({ category, sort, take: limit, published: true })
          .then((rows) => rows.map(toBlogPost));

    fetchPosts
      .then((items) => { if (!cancelled) setPosts(items); })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [category, sort, limit, orgId]);

  return { posts, loading };
}
