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
    if (!res.ok) return { navMenuId: null, footerColumns: [], headerVariant: "minimal", footerVariant: "columns" };
    return res.json();
  } catch {
    return { navMenuId: null, footerColumns: [], headerVariant: "minimal", footerVariant: "columns" };
  }
}

async function fetchActiveTheme(orgId: string, previewId?: string): Promise<Record<string, string>> {
  try {
    const url = previewId
      ? `${API}/public/sites/${orgId}/theme?previewId=${encodeURIComponent(previewId)}`
      : `${API}/public/sites/${orgId}/theme`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    const vars = data?.variables ?? {};
    // Only keep actual CSS custom properties (keys starting with --)
    return Object.fromEntries(
      Object.entries(vars).filter(([k]) => k.startsWith("--"))
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

function buildThemeCss(vars: Record<string, string>): string {
  const entries = Object.entries(vars).filter(([, v]) => typeof v === "string" && v.trim());
  if (!entries.length) return "";
  return `:root { ${entries.map(([k, v]) => `${k}: ${v};`).join(" ")} }`;
}

// Injected when themeSwitcherEnabled — makes `.dark` class on <html> actually change colours.
// Brand colours (primary/secondary/accent) are inherited from the light theme as-is.
const DARK_MODE_CSS = `.dark {
  color-scheme: dark;
  --background: #0f172a;
  --foreground: #e2e8f0;
  --card: #1e293b;
  --card-foreground: #e2e8f0;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --border: #334155;
  --input: #334155;
  --ring: #475569;
}`;

const SYSTEM_FONTS = new Set([
  "system-ui", "sans-serif", "serif", "monospace", "cursive", "fantasy",
  "-apple-system", "BlinkMacSystemFont", "ui-sans-serif", "ui-serif",
]);

function buildGoogleFontsUrl(vars: Record<string, string>): string | null {
  const vals = [vars["--font-heading"], vars["--font-body"]].filter(Boolean);
  const names = new Set<string>();
  for (const val of vals) {
    for (const [, name] of val.matchAll(/['"]([^'"]+)['"]/g)) {
      if (!SYSTEM_FONTS.has(name)) names.add(name);
    }
  }
  if (!names.size) return null;
  const families = [...names]
    .map((n) => `family=${encodeURIComponent(n)}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
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
  searchParams: Promise<{ _chost?: string; previewTheme?: string }>;
}) {
  const { identifier, slug } = await params;
  const { _chost, previewTheme } = await searchParams;

  const org = await resolveOrg(identifier, _chost);
  if (!org) notFound();

  const [themeVars] = await Promise.all([
    fetchActiveTheme(org.id, previewTheme),
  ]);
  const themeCss = buildThemeCss(themeVars);
  const fontUrl = buildGoogleFontsUrl(themeVars);

  const Head = () => (
    <>
      {fontUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontUrl} />
        </>
      )}
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      {org.themeSwitcherEnabled && (
        <style dangerouslySetInnerHTML={{ __html: DARK_MODE_CSS }} />
      )}
    </>
  );

  if (!slug || slug.length === 0) {
    const landing = await fetchLandingPage(org.id);
    if (landing) {
      const layout = await fetchSiteLayout(org.id, landing.layoutId);
      return <><Head /><PageView org={org} page={landing} layout={layout} isLanding /></>;
    }
    const [pages, layout] = await Promise.all([listPages(org.id), fetchSiteLayout(org.id)]);
    return <><Head /><SiteHome org={org} pages={pages} layout={layout} /></>;
  }

  const pageSlug = slug.join("/");
  const page = await fetchPage(org.id, pageSlug);
  if (!page) notFound();
  const layout = await fetchSiteLayout(org.id, page.layoutId);
  return <><Head /><PageView org={org} page={page} layout={layout} /></>;
}
