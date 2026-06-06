import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageView, SiteHome } from "./PageViews";
import type { OrgInfo, CmsPage, PageListItem, SiteLayoutData } from "./PageViews";

// Always fetch fresh — CMS content changes on every publish
export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ─── Data fetchers ────────────────────────────────────────────────────────────

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

async function fetchSiteLayout(orgId: string, layoutId?: string | null): Promise<SiteLayoutData> {
  try {
    const url = layoutId
      ? `${API}/public/sites/${orgId}/layout?layoutId=${encodeURIComponent(layoutId)}`
      : `${API}/public/sites/${orgId}/layout`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { navMenuId: null, footerColumns: [] };
    return res.json();
  } catch {
    return { navMenuId: null, footerColumns: [] };
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

  if (!slug || slug.length === 0) {
    const landing = await fetchLandingPage(org.id);
    if (landing) {
      const layout = await fetchSiteLayout(org.id, landing.layoutId);
      return <PageView org={org} page={landing} layout={layout} isLanding />;
    }
    const [pages, layout] = await Promise.all([listPages(org.id), fetchSiteLayout(org.id)]);
    return <SiteHome org={org} pages={pages} layout={layout} />;
  }

  const pageSlug = slug.join("/");
  const page = await fetchPage(org.id, pageSlug);
  if (!page) notFound();
  const layout = await fetchSiteLayout(org.id, page.layoutId);
  return <PageView org={org} page={page} layout={layout} />;
}
