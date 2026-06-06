import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function listPages(orgId: string): Promise<PageListItem[]> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/pages`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchPage(
  orgId: string,
  slug: string,
): Promise<CmsPage | null> {
  try {
    console.log('orgId', orgId);
    console.log('slug', slug);
    const res = await fetch(
      `${API}/public/sites/${orgId}/pages/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
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
  if (!pageSlug) return { title: org.name };
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
  console.log('org', org);
  if (!org) notFound();

  // Home: list all published pages
  if (!slug || slug.length === 0) {
    const pages = await listPages(org.id);
    return <SiteHome org={org} pages={pages} />;
  }

  // Inner page
  const pageSlug = slug.join("/");
  const page = await fetchPage(org.id, pageSlug);
  if (!page) notFound();
  return <PageView org={org} page={page} />;
}

// ─── UI Components ────────────────────────────────────────────────────────────

function SiteHome({ org, pages }: { org: OrgInfo; pages: PageListItem[] }) {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-6 py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">{org.name}</h1>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {pages.length === 0 ? (
          <p className="text-gray-500">No published pages yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 space-y-0">
            {pages.map((p) => (
              <li key={p.id} className="py-5">
                <a
                  href={`/${p.slug}`}
                  className="group block hover:opacity-80 transition-opacity"
                >
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:underline">
                    {p.title}
                  </h2>
                  {p.metaDesc && (
                    <p className="mt-1 text-gray-500 text-sm line-clamp-2">
                      {p.metaDesc}
                    </p>
                  )}
                  {p.publishedAt && (
                    <p className="mt-1 text-xs text-gray-400">
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
      </div>
    </main>
  );
}

function PageView({ org, page }: { org: OrgInfo; page: CmsPage }) {
  console.log('org', org);
  console.log('page', page);
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← {org.name}
        </a>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold leading-tight">{page.title}</h1>
          {page.metaDesc && (
            <p className="mt-2 text-gray-500">{page.metaDesc}</p>
          )}
          {page.publishedAt && (
            <p className="mt-2 text-xs text-gray-400">
              Published{" "}
              {new Date(page.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>

        {page.content ? (
          // Content is created by trusted org editors via TipTap — safe to render as HTML.
          <article
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-gray-400">No content yet.</p>
        )}
      </div>
    </main>
  );
}
