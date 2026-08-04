"use client";

import { useBlogDetail } from "@/lib/themes/useBlogDetail";
import { useBlogListingFacets } from "@/lib/themes/useBlogListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";
import { CommentsSection } from "@/lib/themes/shared/CommentsSection";
import { NAVY, GOLD, SERIF } from "../theme";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogDetail({ orgId, slug }: { orgId: string; themeIdentifier?: string; slug?: string }) {
  const { post, loading, notFound } = useBlogDetail(orgId, slug ?? "");
  const { facets } = useBlogListingFacets(orgId);

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-[#0d1626] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="aspect-[21/9] rounded-lg bg-gray-100 dark:bg-[#1c2c42] mb-8" />
          <div className="h-8 w-3/4 bg-gray-100 dark:bg-[#1c2c42] mb-4" />
          <div className="h-4 w-full bg-gray-100 dark:bg-[#1c2c42] mb-2" />
          <div className="h-4 w-full bg-gray-100 dark:bg-[#1c2c42]" />
        </div>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <section className="py-24 bg-white dark:bg-[#0d1626] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <EmptyState title="Story not found" message="This story may have been removed or unpublished." />
          <div className="text-center mt-6">
            <a href="/blog" className="text-sm font-semibold text-[#0B1E33] dark:text-white hover:underline">
              &larr; Back to News
            </a>
          </div>
        </div>
      </section>
    );
  }

  const categories = post.category ? post.category.split(",").map((c) => c.trim()).filter(Boolean) : [];

  return (
    <section className="py-20 bg-white dark:bg-[#0d1626] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="text-xs text-gray-500 dark:text-gray-500 mb-8">
          <a href="/" className="hover:text-[#0B1E33] dark:hover:text-white">Home</a>
          <span className="mx-1.5">/</span>
          <a href="/blog" className="hover:text-[#0B1E33] dark:hover:text-white">News</a>
          <span className="mx-1.5">/</span>
          <span className="text-[#0B1E33] dark:text-white font-medium line-clamp-1">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row-reverse gap-12">
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {facets.recentPosts.length > 0 && (
              <div className="rounded-lg border border-gray-100 dark:border-white/10 p-6">
                <h3 className="text-sm font-bold text-[#0B1E33] dark:text-white mb-4" style={{ fontFamily: SERIF }}>
                  Recent Stories
                </h3>
                <ul className="space-y-4">
                  {facets.recentPosts.map((p) => (
                    <li key={p.slug}>
                      <a href={`/blog/${p.slug}`} className="flex items-center gap-3 group">
                        <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-[#e8e2d5] dark:bg-[#1c2c42]">
                          {p.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0B1E33] dark:text-white group-hover:opacity-70 transition-opacity line-clamp-2 leading-snug">
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
              <div className="rounded-lg border border-gray-100 dark:border-white/10 p-6">
                <h3 className="text-sm font-bold text-[#0B1E33] dark:text-white mb-4" style={{ fontFamily: SERIF }}>
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {facets.tags.map((t) => (
                    <a
                      key={t}
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#0B1E33] dark:text-white transition-colors"
                      style={{ border: `1px solid ${GOLD}44` }}
                    >
                      #{t}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <article className="flex-1 min-w-0">
            {post.coverImage && (
              <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-[#e8e2d5] dark:bg-[#1c2c42] mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                    style={{ background: NAVY, color: GOLD }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1E33] dark:text-white mb-2 leading-tight" style={{ fontFamily: SERIF }}>
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{post.subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-100 dark:border-white/10">
              {post.author && <span className="font-medium text-[#0B1E33] dark:text-white">{post.author}</span>}
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
              {post.isFeatured && <span className="font-semibold" style={{ color: GOLD }}>Featured</span>}
            </div>

            {post.body ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:no-underline hover:prose-a:underline"
                style={{ "--tw-prose-links": GOLD } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              post.excerpt && <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{post.excerpt}</p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-1">Tags</span>
                {post.tags.map((t) => (
                  <a
                    key={t}
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#0B1E33] dark:text-white transition-colors"
                    style={{ border: `1px solid ${GOLD}44` }}
                  >
                    #{t}
                  </a>
                ))}
              </div>
            )}

            {post.allowComments && (
              <CommentsSection orgId={orgId} resourceId={post.id} accentColor={GOLD} />
            )}

            <div className="mt-10">
              <a href="/blog" className="text-sm font-semibold inline-flex items-center gap-1 text-[#0B1E33] dark:text-white hover:underline">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
                Back to News
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
