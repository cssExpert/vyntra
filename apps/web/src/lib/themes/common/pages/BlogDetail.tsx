"use client";

import { useBlogDetail } from "@/lib/themes/useBlogDetail";
import { useBlogListingFacets } from "@/lib/themes/useBlogListing";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

const BLUE = "#2563eb";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogDetail({ orgId, slug }: { orgId: string; themeIdentifier?: string; slug?: string }) {
  const { post, loading, notFound } = useBlogDetail(orgId, slug ?? "");
  const { facets } = useBlogListingFacets(orgId);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="aspect-video rounded-2xl bg-gray-200 mb-8" />
          <div className="h-8 w-3/4 bg-gray-200 mb-4 rounded" />
          <div className="h-4 w-full bg-gray-200 mb-2 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-200">
            <EmptyState title="Post not found" message="This post may have been removed or unpublished." />
          </div>
          <div className="text-center mt-6">
            <a href="/blog" className="text-sm font-semibold" style={{ color: BLUE }}>← Back to Blog</a>
          </div>
        </div>
      </section>
    );
  }

  const categories = post.category ? post.category.split(",").map((c) => c.trim()).filter(Boolean) : [];

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt={post.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-6 sm:p-8">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: BLUE }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              {post.subtitle && <p className="text-base text-gray-500 mb-4">{post.subtitle}</p>}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                {post.author && <span className="font-medium text-gray-700">{post.author}</span>}
                {post.publishedAt && <span>· {formatDate(post.publishedAt)}</span>}
              </div>

              {post.body ? (
                <div
                  className="prose max-w-none prose-headings:font-bold prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
                  style={{ "--tw-prose-links": BLUE } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: post.body }}
                />
              ) : (
                post.excerpt && <p className="text-base text-gray-600 leading-relaxed">{post.excerpt}</p>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-100">
                  {post.tags.map((t) => (
                    <a key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
                      #{t}
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <a href="/blog" className="text-sm font-semibold" style={{ color: BLUE }}>← Back to Blog</a>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
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
                          ) : null}
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

            {facets.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {facets.tags.map((t) => (
                    <a key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
                      #{t}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
