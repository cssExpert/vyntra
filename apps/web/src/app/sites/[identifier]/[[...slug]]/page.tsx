import { notFound } from "next/navigation";
import { cookies } from "next/headers";
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

async function fetchLandingPage(orgId: string, lang?: string): Promise<CmsPage | null> {
  try {
    const url = lang
      ? `${API}/public/sites/${orgId}/landing-page?lang=${encodeURIComponent(lang)}`
      : `${API}/public/sites/${orgId}/landing-page`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function listPages(orgId: string, lang?: string): Promise<PageListItem[]> {
  try {
    const url = lang
      ? `${API}/public/sites/${orgId}/pages?lang=${encodeURIComponent(lang)}`
      : `${API}/public/sites/${orgId}/pages`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchPage(orgId: string, slug: string, lang?: string): Promise<CmsPage | null> {
  try {
    const url = lang
      ? `${API}/public/sites/${orgId}/pages/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`
      : `${API}/public/sites/${orgId}/pages/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { cache: "no-store" });
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

async function fetchActiveTheme(orgId: string, previewId?: string): Promise<string> {
  try {
    const url = previewId
      ? `${API}/public/sites/${orgId}/theme?previewId=${encodeURIComponent(previewId)}`
      : `${API}/public/sites/${orgId}/theme`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "shopingo";
    const data = await res.json();
    return (data?.identifier as string) || "shopingo";
  } catch {
    return "shopingo";
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string; slug?: string[] }>;
  searchParams: Promise<{ _chost?: string; previewTheme?: string }>;
}): Promise<Metadata> {
  const { identifier, slug } = await params;
  const { _chost } = await searchParams;
  const org = await resolveOrg(identifier, _chost);
  if (!org) return {};

  const cookieStore = await cookies();
  const lang = cookieStore.get("vyntra_site_lang")?.value;
  const activeLang = (lang && org.siteLanguages?.includes(lang)) ? lang : (org.defaultSiteLanguage ?? "en");

  const pageSlug = slug?.join("/");
  if (!pageSlug) {
    const landing = await fetchLandingPage(org.id, activeLang);
    return {
      title: landing ? `${landing.title} — ${org.name}` : org.name,
      description: landing?.metaDesc ?? undefined,
    };
  }

  const page = await fetchPage(org.id, pageSlug, activeLang);
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
  searchParams: Promise<{ _chost?: string; previewTheme?: string }>;
}) {
  const { identifier, slug } = await params;
  const { _chost, previewTheme } = await searchParams;

  const org = await resolveOrg(identifier, _chost);
  if (!org) notFound();

  // Resolve active language from cookie → org default → "en"
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("vyntra_site_lang")?.value;
  const activeLang = (rawLang && org.siteLanguages?.includes(rawLang))
    ? rawLang
    : (org.defaultSiteLanguage ?? "en");

  const orgThemeIdentifier = await fetchActiveTheme(org.id, previewTheme);

  const Head = () => (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang = ${JSON.stringify(activeLang)};`,
      }}
    />
  );

  if (!slug || slug.length === 0) {
    const landing = await fetchLandingPage(org.id, activeLang);
    if (landing) {
      const themeIdentifier = landing.themeIdentifier ?? orgThemeIdentifier;
      const layout = await fetchSiteLayout(org.id, landing.layoutId);
      return <><Head /><PageView org={org} page={landing} layout={layout} themeIdentifier={themeIdentifier} isLanding /></>;
    }
    const [pages, layout] = await Promise.all([
      listPages(org.id, activeLang),
      fetchSiteLayout(org.id),
    ]);
    return <><Head /><SiteHome org={org} pages={pages} layout={layout} themeIdentifier={orgThemeIdentifier} /></>;
  }

  const pageSlug = slug.join("/");
  const page = await fetchPage(org.id, pageSlug, activeLang);
  if (!page) notFound();
  const themeIdentifier = page.themeIdentifier ?? orgThemeIdentifier;
  const layout = await fetchSiteLayout(org.id, page.layoutId);
  return <><Head /><PageView org={org} page={page} layout={layout} themeIdentifier={themeIdentifier} /></>;
}
