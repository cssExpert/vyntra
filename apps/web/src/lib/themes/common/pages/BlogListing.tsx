"use client";

import { useState } from "react";
import {
  useBlogListing,
  useBlogListingFacets,
  type BlogListingFilters,
  type PublicBlogPost,
} from "@/lib/themes/useBlogListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

const BLUE = "#2563eb";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function PostCard({ post }: { post: PublicBlogPost }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <a href={`/blog/${post.slug}`} className="block relative aspect-video bg-gray-50 overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        {post.pinToTop && (
          <span className="absolute top-3 left-3 text-[11px] font-bold px-2 py-1 rounded-full text-white shadow-sm" style={{ backgroundColor: BLUE }}>
            Pinned
          </span>
        )}
      </a>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400 mb-1.5">
          {post.author && <span className="font-medium text-gray-500">{post.author}</span>}
          {post.publishedAt && <span>· {formatDate(post.publishedAt)}</span>}
        </div>
        <a href={`/blog/${post.slug}`}>
          <h2 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors mb-1.5 line-clamp-2">
            {post.title}
          </h2>
        </a>
        {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
        <a href={`/blog/${post.slug}`} className="text-sm font-semibold" style={{ color: BLUE }}>
          Read more →
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Search</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full text-sm rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus:border-gray-400"
          />
        </div>
      )}

      {showCategories && facets.categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(undefined)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                !category ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={!category ? { backgroundColor: BLUE } : undefined}
            >
              All
            </button>
            {facets.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.name ? undefined : c.name)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  category === c.name ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                style={category === c.name ? { backgroundColor: BLUE } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.recentPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Posts</h3>
          <ul className="space-y-3">
            {facets.recentPosts.map((p) => (
              <li key={p.slug}>
                <a href={`/blog/${p.slug}`} className="flex items-center gap-3">
                  <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{p.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(p.publishedAt)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showTags && facets.tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Popular Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {facets.tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? undefined : t)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                  tag === t ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                style={tag === t ? { backgroundColor: BLUE } : undefined}
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

  const { facets, pageSize, sidebarSettings, loading: facetsLoading } = useBlogListingFacets(orgId);

  const filters: BlogListingFilters = { category, tag, search: search.trim() || undefined };
  const { posts, total, loading, loadingMore, hasMore, loadMore } = useBlogListing(orgId, filters, pageSize);

  const showSidebar = sidebarSettings.showSidebar;

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading posts…" : `${total} post${total !== 1 ? "s" : ""} available`}
          </p>
        </header>

        <div className={`grid grid-cols-1 ${showSidebar ? "lg:grid-cols-[1fr_320px]" : ""} gap-8`}>
          <div className="min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-200 border border-gray-200 animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200">
                <EmptyState title="No posts found" message="Try a different search, category, or tag." />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {posts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 text-sm font-semibold rounded-full text-white transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: BLUE }}
                    >
                      {loadingMore ? "Loading…" : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {showSidebar && (
            facetsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
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
            )
          )}
        </div>
      </div>
    </section>
  );
}
