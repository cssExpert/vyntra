"use client";

import type { BlogSectionData } from "@/lib/themes/types";
import { useBlogPosts } from "@/lib/themes/useBlogPosts";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

export default function BlogSection({ data, orgId }: { data: BlogSectionData; orgId?: string }) {
  const { posts, loading } = useBlogPosts(data, orgId);
  const visible = posts.slice(0, data.postsCount ?? 3);
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{data.title}</h2>}
        {data.subtitle && <p className="text-gray-500 text-center mb-10">{data.subtitle}</p>}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading posts…</p>
        ) : visible.length === 0 ? (
          <EmptyState title="No posts found" message="Try a different category, or publish your first post." />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((p) => (
            <article key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {p.image && <img src={p.image} alt={p.title} className="w-full aspect-video object-cover" />}
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">{p.date} · {p.author}</p>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{p.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
