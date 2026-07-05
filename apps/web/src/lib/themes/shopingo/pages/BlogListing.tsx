"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useBlogListing,
  useBlogListingFacets,
  type BlogListingFilters,
  type PublicBlogPost,
} from "@/lib/themes/useBlogListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

const ORANGE = "#e4611e";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function PostCard({ post }: { post: PublicBlogPost }) {
  return (
    <article className="flex flex-col sm:flex-row gap-5 py-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <a href={`/blog/${post.slug}`} className="relative overflow-hidden bg-gray-50 dark:bg-[#2a2a2e] w-full sm:w-64 aspect-video sm:aspect-[4/3] shrink-0">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        {post.pinToTop && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white shadow-sm" style={{ backgroundColor: ORANGE }}>
            Pinned
          </span>
        )}
      </a>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          {post.author && <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.isFeatured && (
            <span className="font-semibold" style={{ color: ORANGE }}>Featured</span>
          )}
        </div>
        <a href={`/blog/${post.slug}`}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity mb-1.5 line-clamp-2">
            {post.title}
          </h2>
        </a>
        {post.excerpt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <a
          href={`/blog/${post.slug}`}
          className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
          style={{ color: ORANGE }}
        >
          Read More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </article>
  );
}

function Sidebar({
  facets,
  showSearch,
  showCategories,
  showTags,
  search,
  setSearch,
  category,
  setCategory,
  tag,
  setTag,
}: {
  facets: ReturnType<typeof useBlogListingFacets>["facets"];
  showSearch: boolean;
  showCategories: boolean;
  showTags: boolean;
  search: string;
  setSearch: (v: string) => void;
  category: string | undefined;
  setCategory: (v: string | undefined) => void;
  tag: string | undefined;
  setTag: (v: string | undefined) => void;
}) {
  return (
    <div className="space-y-6">
      {showSearch && (
        <div className="border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Search</h3>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full text-sm border border-gray-300 dark:border-gray-600 px-3 py-2 pr-9 bg-white dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      )}

      {showCategories && facets.categories.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(undefined)}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                !category ? "text-white border-transparent" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400"
              }`}
              style={!category ? { backgroundColor: ORANGE } : undefined}
            >
              All
            </button>
            {facets.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.name ? undefined : c.name)}
                className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  category === c.name ? "text-white border-transparent" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400"
                }`}
                style={category === c.name ? { backgroundColor: ORANGE } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.recentPosts.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Recent Posts</h3>
          <ul className="space-y-3">
            {facets.recentPosts.map((p) => (
              <li key={p.slug}>
                <a href={`/blog/${p.slug}`} className="flex items-center gap-3 group">
                  <div className="w-14 h-14 shrink-0 overflow-hidden bg-gray-50 dark:bg-[#2a2a2e]">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:opacity-70 transition-opacity line-clamp-2 leading-snug">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(p.publishedAt)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showTags && facets.tags.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Popular Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {facets.tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? undefined : t)}
                className={`px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                  tag === t
                    ? "text-white border-transparent"
                    : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400"
                }`}
                style={tag === t ? { backgroundColor: ORANGE } : undefined}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogListing({ orgId }: { orgId: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [tag, setTag] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { facets, pageSize, sidebarSettings, loading: facetsLoading } = useBlogListingFacets(orgId);

  const filters: BlogListingFilters = { category, tag, search: search.trim() || undefined };
  const { posts, total, loading, loadingMore, hasMore, loadMore } = useBlogListing(orgId, filters, pageSize);

  const showSidebar = sidebarSettings.showSidebar;

  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-800 dark:hover:text-gray-200">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Blog</span>
        </nav>

        {showSidebar && (
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            className="lg:hidden w-full flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 px-5 py-3.5 mb-4 text-sm font-bold text-gray-900 dark:text-gray-100"
          >
            <span className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
              Sidebar
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        <div className="flex flex-col lg:flex-row-reverse gap-10">
          {showSidebar && (
            <aside className={`w-full lg:w-80 shrink-0 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
              {facetsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse" />
                  ))}
                </div>
              ) : (
                <Sidebar
                  facets={facets}
                  showSearch={sidebarSettings.showSearch}
                  showCategories={sidebarSettings.showCategories}
                  showTags={sidebarSettings.showTags}
                  search={search}
                  setSearch={setSearch}
                  category={category}
                  setCategory={setCategory}
                  tag={tag}
                  setTag={setTag}
                />
              )}
            </aside>
          )}

          {/* Post list */}
          <div className="flex-1 min-w-0">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {loading ? "Loading posts…" : `${total} post${total !== 1 ? "s" : ""} found`}
              </p>
            </header>

            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-64 aspect-[4/3] bg-gray-200 dark:bg-[#2a2a2e] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-[#2a2a2e] animate-pulse" />
                      <div className="h-3 w-full bg-gray-200 dark:bg-[#2a2a2e] animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#2a2a2e] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="border border-gray-200 dark:border-gray-700">
                <EmptyState title="No posts found" message="Try a different search, category, or tag." />
              </div>
            ) : (
              <>
                <div>
                  {posts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 text-sm font-semibold rounded text-white transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: ORANGE }}
                    >
                      {loadingMore ? "Loading…" : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
