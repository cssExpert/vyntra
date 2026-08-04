"use client";

import { useState } from "react";
import {
  useBlogListing,
  useBlogListingFacets,
  type BlogListingFilters,
  type PublicBlogPost,
} from "@/lib/themes/useBlogListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";
import { NAVY, GOLD, SERIF } from "../theme";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function FeaturedCard({ post }: { post: PublicBlogPost }) {
  return (
    <article className="grid lg:grid-cols-2 gap-0 rounded-lg overflow-hidden bg-white dark:bg-[#132038] border border-gray-100 dark:border-white/10 mb-16">
      <a href={`/blog/${post.slug}`} className="block relative h-64 lg:h-full min-h-[300px] overflow-hidden bg-[#e8e2d5] dark:bg-[#1c2c42]">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#0B1E33]/15 dark:text-white/10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
      </a>
      <div className="p-8 lg:p-12 flex flex-col justify-center">
        <span
          className="inline-block w-fit text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-5"
          style={{ background: NAVY, color: GOLD }}
        >
          {post.category || "Featured"}
        </span>
        <a href={`/blog/${post.slug}`}>
          <h2 className="font-bold text-2xl md:text-3xl leading-tight text-[#0B1E33] dark:text-white mb-4" style={{ fontFamily: SERIF }}>
            {post.title}
          </h2>
        </a>
        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{formatDate(post.publishedAt)}</p>
        )}
        <a href={`/blog/${post.slug}`} className="font-semibold text-[#0B1E33] dark:text-white hover:underline w-fit">
          Read More &rarr;
        </a>
      </div>
    </article>
  );
}

function PostCard({ post }: { post: PublicBlogPost }) {
  return (
    <article className="group rounded-lg overflow-hidden bg-white dark:bg-[#132038] border border-gray-100 dark:border-white/10">
      <a href={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-[#e8e2d5] dark:bg-[#1c2c42]">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#0B1E33]/15 dark:text-white/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
      </a>
      <div className="p-6">
        {post.category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: GOLD }}>
            {post.category}
          </span>
        )}
        <a href={`/blog/${post.slug}`}>
          <h3 className="font-bold text-lg text-[#0B1E33] dark:text-white mb-2 leading-snug line-clamp-2" style={{ fontFamily: SERIF }}>
            {post.title}
          </h3>
        </a>
        {post.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(post.publishedAt)}</p>
          <a href={`/blog/${post.slug}`} className="text-xs font-semibold text-[#0B1E33] dark:text-white hover:underline whitespace-nowrap">
            Read More &rarr;
          </a>
        </div>
      </div>
    </article>
  );
}

function FilterBar({
  facets,
  showSearch,
  showCategories,
  search,
  setSearch,
  category,
  setCategory,
}: {
  facets: ReturnType<typeof useBlogListingFacets>["facets"];
  showSearch: boolean;
  showCategories: boolean;
  search: string;
  setSearch: (v: string) => void;
  category: string | undefined;
  setCategory: (v: string | undefined) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-14">
      {showSearch && (
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            className="w-full text-sm rounded-full border border-gray-200 dark:border-white/15 px-4 py-2.5 pr-9 bg-white dark:bg-[#0d1626] text-[#0B1E33] dark:text-white placeholder:text-gray-400 outline-none focus:border-[#C9A961]"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      )}

      {showCategories && facets.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors"
            style={
              !category
                ? { background: NAVY, color: GOLD }
                : { border: `1px solid ${GOLD}44` }
            }
          >
            All
          </button>
          {facets.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(category === c.name ? undefined : c.name)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors text-[#0B1E33] dark:text-white"
              style={
                category === c.name
                  ? { background: NAVY, color: GOLD }
                  : { border: `1px solid ${GOLD}44` }
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogListing({ orgId }: { orgId: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [tag, setTag] = useState<string | undefined>();

  const { facets, pageSize, sidebarSettings, loading: facetsLoading } = useBlogListingFacets(orgId);
  const filters: BlogListingFilters = { category, tag, search: search.trim() || undefined };
  const { posts, total, loading, loadingMore, hasMore, loadMore } = useBlogListing(orgId, filters, pageSize);

  const hasFilters = !!(category || tag || search.trim());
  const featured = !hasFilters && posts.length > 0
    ? posts.find((p) => p.isFeatured || p.pinToTop) ?? posts[0]
    : null;
  const gridPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <>
      <section
        className="py-24 md:py-32 text-center"
        style={{ background: `radial-gradient(circle at 50% 20%, #16304f 0%, ${NAVY} 70%)`, color: "#fff" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>Community</p>
          <h1 className="text-4xl sm:text-6xl font-bold mb-5" style={{ fontFamily: SERIF }}>News</h1>
          <p className="text-gray-300 leading-relaxed max-w-xl mx-auto">
            Academic milestones, campus happenings, and stories from our community — told as they happen.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-[#0d1626]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {!facetsLoading && (sidebarSettings.showSearch || sidebarSettings.showCategories) && (
            <FilterBar
              facets={facets}
              showSearch={sidebarSettings.showSearch}
              showCategories={sidebarSettings.showCategories}
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
            />
          )}

          {featured && <FeaturedCard post={featured} />}

          {!loading && (
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E33] dark:text-white mb-10" style={{ fontFamily: SERIF }}>
              {hasFilters ? `${total} result${total !== 1 ? "s" : ""}` : "More Stories"}
            </h2>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-100 dark:border-white/10">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-[#1c2c42] animate-pulse" />
                  <div className="p-6 space-y-2">
                    <div className="h-3 w-1/3 bg-gray-100 dark:bg-[#1c2c42] animate-pulse" />
                    <div className="h-4 w-full bg-gray-100 dark:bg-[#1c2c42] animate-pulse" />
                    <div className="h-3 w-2/3 bg-gray-100 dark:bg-[#1c2c42] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : gridPosts.length === 0 ? (
            <div className="rounded-lg border border-gray-100 dark:border-white/10">
              <EmptyState title="No stories found" message="Try a different search or category." />
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((p) => <PostCard key={p.id} post={p} />)}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-7 py-3 rounded text-sm font-semibold tracking-wide transition-opacity disabled:opacity-60"
                    style={{ background: NAVY, color: "#fff" }}
                  >
                    {loadingMore ? "Loading…" : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
