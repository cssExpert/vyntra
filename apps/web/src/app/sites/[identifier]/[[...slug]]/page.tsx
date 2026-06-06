import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { EditorNode } from "@/types/editor";
import { NodeRenderer } from "./NodeRenderer";

// Always fetch fresh — CMS content changes on every publish
export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
}

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

interface PageListItem {
  id: string;
  title: string;
  slug: string;
  metaDesc: string | null;
  publishedAt: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseNodes(content: string | null): EditorNode[] | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as EditorNode[];
  } catch {
    // legacy HTML content — handled separately
  }
  return null;
}

// ─── Data fetchers (server-side, cached 60 s) ─────────────────────────────────

async function resolveOrg(
  identifier: string,
  customHost?: string,
): Promise<OrgInfo | null> {
  try {
    const url =
      identifier === "_host" && customHost
        ? `${API}/public/resolve-domain?domain=${encodeURIComponent(customHost)}`
        : `${API}/public/resolve-subdomain/${encodeURIComponent(identifier)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchLandingPage(orgId: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/landing-page`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function listPages(orgId: string): Promise<PageListItem[]> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/pages`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchPage(orgId: string, slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(
      `${API}/public/sites/${orgId}/pages/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string; slug?: string[] }>;
  searchParams: Promise<{ _chost?: string }>;
}): Promise<Metadata> {
  const { identifier, slug } = await params;
  const { _chost } = await searchParams;
  const org = await resolveOrg(identifier, _chost);
  if (!org) return {};

  const pageSlug = slug?.join("/");
  if (!pageSlug) {
    const landing = await fetchLandingPage(org.id);
    return {
      title: landing ? `${landing.title} — ${org.name}` : org.name,
      description: landing?.metaDesc ?? undefined,
    };
  }

  const page = await fetchPage(org.id, pageSlug);
  return {
    title: page ? `${page.title} — ${org.name}` : org.name,
    description: page?.metaDesc ?? undefined,
    keywords: page?.metaKeywords ?? undefined,
  };
}

// ─── Page component ───────────────────────────────────────────────────────────

export default async function PublicSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string; slug?: string[] }>;
  searchParams: Promise<{ _chost?: string }>;
}) {
  const { identifier, slug } = await params;
  const { _chost } = await searchParams;

  const org = await resolveOrg(identifier, _chost);
  if (!org) notFound();

  // Root URL → landing page, fallback to page list
  if (!slug || slug.length === 0) {
    const landing = await fetchLandingPage(org.id);
    if (landing) return <PageView org={org} page={landing} isLanding />;
    const pages = await listPages(org.id);
    return <SiteHome org={org} pages={pages} />;
  }

  const pageSlug = slug.join("/");
  const page = await fetchPage(org.id, pageSlug);
  if (!page) notFound();
  return <PageView org={org} page={page} />;
}

// ─── Page view (editor content) ───────────────────────────────────────────────

function PageView({
  org,
  page,
  isLanding = false,
}: {
  org: OrgInfo;
  page: CmsPage;
  isLanding?: boolean;
}) {
  const nodes = parseNodes(page.content);

  // Editor-built content: render the node tree directly (it contains its own layout)
  if (nodes) {
    return (
      <div className="min-h-screen bg-white">
        <NodeRenderer nodes={nodes} />
      </div>
    );
  }

  // Legacy / seed HTML content: render with a professional article wrapper
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Minimal site nav */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-tight text-gray-900 hover:text-gray-600 transition-colors">
            {org.name}
          </a>
          {!isLanding && (
            <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Home
            </a>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900">
            {page.title}
          </h1>
          {page.metaDesc && (
            <p className="mt-4 text-xl text-gray-500 leading-relaxed">{page.metaDesc}</p>
          )}
          {page.publishedAt && (
            <p className="mt-4 text-sm text-gray-400">
              {new Date(page.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>

        <article
          className="prose prose-lg prose-gray max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
        />
      </main>

      <footer className="border-t border-gray-100 mt-24 py-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {org.name}
      </footer>
    </div>
  );
}

// ─── Site home (page list) ────────────────────────────────────────────────────

function SiteHome({ org, pages }: { org: OrgInfo; pages: PageListItem[] }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <span className="text-lg font-bold tracking-tight text-gray-900">{org.name}</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-12">{org.name}</h1>

        {pages.length === 0 ? (
          <p className="text-gray-400">No published pages yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pages.map((p) => (
              <li key={p.id} className="py-8">
                <a href={`/${p.slug}`} className="group block">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h2>
                  {p.metaDesc && (
                    <p className="mt-2 text-gray-500 leading-relaxed line-clamp-2">{p.metaDesc}</p>
                  )}
                  {p.publishedAt && (
                    <p className="mt-3 text-sm text-gray-400">
                      {new Date(p.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-24 py-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {org.name}
      </footer>
    </div>
  );
}
