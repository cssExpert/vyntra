import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface PublicBlogPost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string | null;
  category: string | null;
  publishedAt: string | null;
  isFeatured: boolean;
  pinToTop: boolean;
  tags: string[];
}

export interface PublicBlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicRecentPost {
  title: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
}

export interface BlogFacets {
  categories: PublicBlogCategory[];
  tags: string[];
  recentPosts: PublicRecentPost[];
}

export interface BlogSidebarSettings {
  showSidebar: boolean;
  showSearch: boolean;
  showCategories: boolean;
  showTags: boolean;
}

export interface BlogListingFilters {
  category?: string;
  tag?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 6;
const DEFAULT_SIDEBAR_SETTINGS: BlogSidebarSettings = {
  showSidebar: true,
  showSearch: true,
  showCategories: true,
  showTags: true,
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json() as Promise<T>;
}

/** Category/tag/recent-post facets for the sidebar, plus the org's configured page size + sidebar section visibility. */
export function useBlogListingFacets(orgId: string) {
  const [facets, setFacets] = useState<BlogFacets>({ categories: [], tags: [], recentPosts: [] });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sidebarSettings, setSidebarSettings] = useState<BlogSidebarSettings>(DEFAULT_SIDEBAR_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJson<BlogFacets>(`${API}/public/sites/${orgId}/blogs/facets`),
      getJson<{ postsPerPage: number } & BlogSidebarSettings>(`${API}/public/sites/${orgId}/blogs/page-settings`),
    ])
      .then(([f, ps]) => {
        if (cancelled) return;
        setFacets(f);
        setPageSize(ps.postsPerPage);
        setSidebarSettings({
          showSidebar: ps.showSidebar,
          showSearch: ps.showSearch,
          showCategories: ps.showCategories,
          showTags: ps.showTags,
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orgId]);

  return { facets, pageSize, sidebarSettings, loading };
}

/** Filtered, "load more"-paginated blog listing for the /blog page — backed by the live catalog (published + public posts only, enforced server-side). */
export function useBlogListing(orgId: string, filters: BlogListingFilters, pageSize: number = DEFAULT_PAGE_SIZE) {
  const { category, tag, search } = filters;

  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const skipRef = useRef(0);

  function buildQs(skip: number) {
    const qs = new URLSearchParams({ skip: String(skip), take: String(pageSize) });
    if (category) qs.set("category", category);
    if (tag) qs.set("tag", tag);
    if (search) qs.set("search", search);
    return qs;
  }

  useEffect(() => {
    let cancelled = false;
    skipRef.current = 0;
    setLoading(true);
    getJson<{ data: PublicBlogPost[]; total: number }>(
      `${API}/public/sites/${orgId}/blogs?${buildQs(0)}`,
    )
      .then(({ data, total: t }) => {
        if (cancelled) return;
        setPosts(data);
        setTotal(t);
      })
      .catch(() => { if (!cancelled) { setPosts([]); setTotal(0); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, category, tag, search, pageSize]);

  async function loadMore() {
    const nextSkip = skipRef.current + pageSize;
    setLoadingMore(true);
    try {
      const { data, total: t } = await getJson<{ data: PublicBlogPost[]; total: number }>(
        `${API}/public/sites/${orgId}/blogs?${buildQs(nextSkip)}`,
      );
      skipRef.current = nextSkip;
      setPosts((prev) => [...prev, ...data]);
      setTotal(t);
    } catch {
      // keep existing posts; user can retry via the Load More button
    } finally {
      setLoadingMore(false);
    }
  }

  return {
    posts,
    total,
    loading,
    loadingMore,
    hasMore: posts.length < total,
    loadMore,
  };
}
