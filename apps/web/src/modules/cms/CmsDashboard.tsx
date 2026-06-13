"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Globe,
  ImageIcon,
  LayoutTemplate,
  Plus,
  RefreshCw,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { cmsDashboard, type CmsDashboardStats } from "@/lib/api";

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function blogStatus(b: CmsDashboardStats["recentBlogs"][number]) {
  if (b.published)
    return {
      label: "Published",
      cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
  if (b.publishedAt && new Date(b.publishedAt) > new Date())
    return {
      label: "Scheduled",
      cls: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };
  return {
    label: "Draft",
    cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  href,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconClass: string;
  href?: string;
  sub?: string;
}) {
  const inner = (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-foreground leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function CmsDashboard() {
  const [stats, setStats] = useState<CmsDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await cmsDashboard.stats());
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-muted" />
          <div className="h-72 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <p className="text-sm text-muted-foreground">{error ?? "No data"}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const publishRate =
    stats.totalBlogs > 0
      ? Math.round((stats.published / stats.totalBlogs) * 100)
      : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            CMS Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Content performance across blogs, pages &amp; media
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/cms/blogs/new"
            className="group flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-600 text-primary-foreground text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4" />
            New Blog Post
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Blogs"
          value={stats.totalBlogs}
          icon={BookOpen}
          iconClass="bg-violet-500/10 text-violet-600"
          href="/cms/blogs"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={CheckCircle2}
          iconClass="bg-emerald-500/10 text-emerald-600"
          href="/cms/blogs"
          sub={`${publishRate}% publish rate`}
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon={FileText}
          iconClass="bg-amber-500/10 text-amber-600"
          href="/cms/blogs"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          icon={Clock}
          iconClass="bg-blue-500/10 text-blue-600"
          href="/cms/blogs"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Categories"
          value={stats.totalCategories}
          icon={FolderOpen}
          iconClass="bg-orange-500/10 text-orange-600"
          href="/cms/blog-categories"
        />
        <StatCard
          label="Tags"
          value={stats.totalTags}
          icon={Tag}
          iconClass="bg-pink-500/10 text-pink-600"
        />
        <StatCard
          label="Pages"
          value={stats.totalPages}
          icon={LayoutTemplate}
          iconClass="bg-cyan-500/10 text-cyan-600"
          href="/cms/pages"
          sub={`${stats.publishedPages} published`}
        />
        <StatCard
          label="Media Assets"
          value={stats.totalMedia}
          icon={ImageIcon}
          iconClass="bg-rose-500/10 text-rose-600"
          href="/cms/gallery"
        />
      </div>

      {/* ── Publish rate bar + featured ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 col-span-1 sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Publish Rate
              </span>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {publishRate}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${publishRate}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {stats.published} published
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              {stats.scheduled} scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              {stats.drafts} drafts
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Featured Posts
            </p>
            <p className="text-2xl font-extrabold text-foreground leading-tight">
              {stats.featured}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              pinned to homepage
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent blogs + top categories ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent blogs */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <SectionHeader
            title="Recent Blog Posts"
            action={
              <Link
                href="/cms/blogs"
                className="text-[10px] font-bold text-primary hover:underline"
              >
                View all →
              </Link>
            }
          />

          {stats.recentBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                No blog posts yet.
              </p>
              <Link
                href="/cms/blogs/new"
                className="px-3 py-1.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg"
              >
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentBlogs.map((blog) => {
                const status = blogStatus(blog);
                return (
                  <div
                    key={blog.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {/* Cover thumbnail */}
                    <div className="w-12 h-9 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {blog.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={blog.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/cms/blogs/${blog.id}/edit`}
                        className="text-xs font-semibold text-foreground truncate block hover:text-primary transition-colors"
                      >
                        {blog.title}
                      </Link>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {blog.author ?? "Unknown"} · {timeAgo(blog.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${status.cls}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top categories */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <SectionHeader
              title="Top Categories"
              action={
                <Link
                  href="/cms/blog-categories"
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Manage →
                </Link>
              }
            />

            {stats.topCategories.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">
                No categories used yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.topCategories.map((cat, i) => {
                  const pct =
                    stats.totalBlogs > 0
                      ? Math.round((cat.count / stats.totalBlogs) * 100)
                      : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {cat.name}
                        </span>
                        <span className="text-muted-foreground ml-2 shrink-0">
                          {cat.count} post{cat.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `hsl(${(i * 55) % 360}, 65%, 55%)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top tags */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <SectionHeader title="Top Tags" />

            {stats.topTags.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">
                No tags used yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {stats.topTags.map((tag, i) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                    style={{
                      background: `hsl(${(i * 43 + 200) % 360}, 70%, 94%)`,
                      borderColor: `hsl(${(i * 43 + 200) % 360}, 60%, 78%)`,
                      color: `hsl(${(i * 43 + 200) % 360}, 50%, 38%)`,
                    }}
                  >
                    {tag.name}
                    <span className="opacity-70">·{tag.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <SectionHeader title="Quick Actions" />
            <div className="space-y-2">
              {[
                {
                  label: "Write New Blog Post",
                  href: "/cms/blogs/new",
                  icon: Plus,
                  cls: "bg-primary/10 text-primary hover:bg-primary/20",
                },
                {
                  label: "Manage Categories",
                  href: "/cms/blog-categories",
                  icon: FolderOpen,
                  cls: "bg-muted hover:bg-muted/70 text-foreground",
                },
                {
                  label: "Edit Pages",
                  href: "/cms/pages",
                  icon: Globe,
                  cls: "bg-muted hover:bg-muted/70 text-foreground",
                },
                {
                  label: "Media Gallery",
                  href: "/cms/gallery",
                  icon: ImageIcon,
                  cls: "bg-muted hover:bg-muted/70 text-foreground",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${action.cls}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
