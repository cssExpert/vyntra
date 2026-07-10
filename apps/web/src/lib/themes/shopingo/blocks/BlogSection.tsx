"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogSectionData, BlogPost } from "@/lib/themes/types";
import { useBlogPosts } from "@/lib/themes/useBlogPosts";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

// ── Post card (grid mode) ─────────────────────────────────────────────────────

function PostCard({ post, index, animate }: { post: BlogPost; index: number; animate: boolean }) {
  const card = (
    <a
      href={`/blog/${post.slug}`}
      className="group bg-white dark:bg-[#1c1c1e] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow block h-full"
    >
      <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-[#2a2a2e]">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{post.date} · {post.author}</p>
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#e4611e] transition-colors line-clamp-2 mb-2">{post.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>
        <span className="inline-block mt-4 text-xs font-semibold text-[#e4611e]">Read More →</span>
      </div>
    </a>
  );
  if (!animate) return card;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="h-full"
    >
      {card}
    </motion.div>
  );
}

// ── List card (list mode) ─────────────────────────────────────────────────────

function ListCard({ post, index, animate }: { post: BlogPost; index: number; animate: boolean }) {
  const card = (
    <a
      href={`/blog/${post.slug}`}
      className="group flex gap-4 bg-white dark:bg-[#1c1c1e] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-4"
    >
      <div className="w-28 sm:w-36 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-[#2a2a2e] aspect-video">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{post.date} · {post.author}</p>
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#e4611e] transition-colors line-clamp-2 mb-1">{post.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
        <span className="inline-block mt-2 text-xs font-semibold text-[#e4611e]">Read More →</span>
      </div>
    </a>
  );
  if (!animate) return card;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      {card}
    </motion.div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ data }: { data: BlogSectionData }) {
  const style = data.titleStyle ?? "default";
  if (style === "badge") {
    return (
      <div className="text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest bg-[#e4611e]/10 text-[#e4611e] rounded-full mb-3">Latest Posts</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{data.title}</h2>
        {data.subtitle && <p className="mt-2 text-gray-500 dark:text-gray-400">{data.subtitle}</p>}
      </div>
    );
  }
  if (style === "underline") {
    return (
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white border-b-2 border-[#e4611e] pb-2 inline-block">{data.title}</h2>
        {data.subtitle && <p className="mt-3 text-gray-500 dark:text-gray-400">{data.subtitle}</p>}
      </div>
    );
  }
  if (style === "minimal") {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{data.title}</h2>
        {data.subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{data.subtitle}</p>}
      </div>
    );
  }
  return (
    <div className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{data.title}</h2>
      {data.subtitle && <p className="mt-2 text-gray-500 dark:text-gray-400">{data.subtitle}</p>}
      <div className="mt-3 mx-auto w-12 h-1 rounded bg-[#e4611e]" />
    </div>
  );
}

// ── Slider view ───────────────────────────────────────────────────────────────

function SliderView({ data, posts }: { data: BlogSectionData; posts: BlogPost[] }) {
  const [idx, setIdx] = useState(0);
  const count = posts.length;
  const maxIdx = Math.max(0, count - 3);
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(maxIdx, i + 1));

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${idx * 33.333}%)` }}
        >
          {posts.map((post, i) => (
            <div key={post.id} className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
              <PostCard post={post} index={i} animate={false} />
            </div>
          ))}
        </div>
      </div>

      {data.showNavigation && count > 3 && (
        <>
          <button
            onClick={prev}
            disabled={idx === 0}
            className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 shadow-md text-gray-600 dark:text-gray-300 hover:text-[#e4611e] disabled:opacity-30 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            disabled={idx >= maxIdx}
            className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 shadow-md text-gray-600 dark:text-gray-300 hover:text-[#e4611e] disabled:opacity-30 transition"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {data.showPagination && count > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(Math.min(i, maxIdx))}
              aria-label={`Go to post ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-[#e4611e] w-4" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Grid / List with optional paging ─────────────────────────────────────────

function GridListView({ data, posts }: { data: BlogSectionData; posts: BlogPost[] }) {
  const perPage = data.postsCount ?? 3;
  const [page, setPage] = useState(0);
  const animate = data.animateCards ?? false;
  const isList = data.displayMode === "list";
  const totalPages = Math.ceil(posts.length / perPage);
  const visible = data.showPaging
    ? posts.slice(page * perPage, (page + 1) * perPage)
    : posts.slice(0, perPage);

  return (
    <div>
      <div className={isList ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
        {visible.map((post, i) =>
          isList
            ? <ListCard key={post.id} post={post} index={i} animate={animate} />
            : <PostCard key={post.id} post={post} index={i} animate={animate} />
        )}
      </div>

      {data.showPaging && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                page === i
                  ? "bg-[#e4611e] text-white"
                  : "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function BlogSection({ data, orgId }: { data: BlogSectionData; orgId?: string }) {
  const { posts, loading } = useBlogPosts(data, orgId);
  const isSlider = data.displayMode === "slider";

  return (
    <section className="py-14 bg-[#f5f5f5] dark:bg-[#121214]">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${isSlider ? "px-8 sm:px-10" : ""}`}>
        <SectionTitle data={data} />
        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">Loading posts…</p>
        ) : posts.length === 0 ? (
          <EmptyState title="No posts found" message="Try a different category, or publish your first post." />
        ) : isSlider ? (
          <SliderView data={data} posts={posts} />
        ) : (
          <GridListView data={data} posts={posts} />
        )}
      </div>
    </section>
  );
}
