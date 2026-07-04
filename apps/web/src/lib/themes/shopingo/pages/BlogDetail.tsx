"use client";

import { useBlogDetail } from "@/lib/themes/useBlogDetail";
import { useBlogListingFacets } from "@/lib/themes/useBlogListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

const ORANGE = "#e4611e";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogDetail({ orgId, slug }: { orgId: string; themeIdentifier?: string; slug?: string }) {
  const { post, loading, notFound } = useBlogDetail(orgId, slug ?? "");
  const { facets } = useBlogListingFacets(orgId);

  if (loading) {
    return (
      <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 dark:bg-[#2a2a2e] mb-8" />
          <div className="aspect-[21/9] bg-gray-200 dark:bg-[#2a2a2e] mb-8" />
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-[#2a2a2e] mb-4" />
          <div className="h-4 w-full bg-gray-200 dark:bg-[#2a2a2e] mb-2" />
          <div className="h-4 w-full bg-gray-200 dark:bg-[#2a2a2e]" />
        </div>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <section className="py-16 bg-white dark:bg-[#121214] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <EmptyState title="Post not found" message="This post may have been removed or unpublished." />
          <div className="text-center mt-6">
            <a href="/blog" className="text-sm font-semibold" style={{ color: ORANGE }}>← Back to Blog</a>
          </div>
        </div>
      </section>
    );
  }

  const categories = post.category ? post.category.split(",").map((c) => c.trim()).filter(Boolean) : [];

  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          <a href="/" className="hover:text-gray-800 dark:hover:text-gray-200">Home</a>
          <span className="mx-1.5">/</span>
          <a href="/blog" className="hover:text-gray-800 dark:hover:text-gray-200">Blog</a>
          <span className="mx-1.5">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row-reverse gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
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
                          ) : null}
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

            {facets.tags.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {facets.tags.map((t) => (
                    <a
                      key={t}
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className="px-2.5 py-1 text-[11px] font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors"
                    >
                      #{t}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Article */}
          <article className="flex-1 min-w-0">
            {post.coverImage && (
              <div className="relative aspect-[21/9] bg-gray-50 dark:bg-[#2a2a2e] overflow-hidden mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((c) => (
                  <span key={c} className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: ORANGE }}>
                    {c}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{post.subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              {post.author && <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>}
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
              {post.isFeatured && <span className="font-semibold" style={{ color: ORANGE }}>Featured</span>}
            </div>

            {post.body ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:no-underline hover:prose-a:underline prose-img:rounded-none"
                style={{ "--tw-prose-links": ORANGE } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              post.excerpt && <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">{post.excerpt}</p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-1">Tags</span>
                {post.tags.map((t) => (
                  <a
                    key={t}
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className="px-2.5 py-1 text-[11px] font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors"
                  >
                    #{t}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-10">
              <a href="/blog" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: ORANGE }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
                Back to Blog
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
