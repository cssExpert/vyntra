import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { PageView, SiteHome, SystemPageView } from "./PageViews";
import type { OrgInfo, CmsPage, PageListItem, SiteLayoutData, SystemPageSettingsPublic } from "./PageViews";
import { resolveSystemPageType, type SystemPageType } from "@/lib/themes/systemPages";
import type { PublicBlogDetailPost } from "@/lib/themes/useBlogDetail";

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

/** SEO/OG/Favicon/Scripts/Styles/page-size for the /shop system page, set via CMS → Page Settings. */
async function fetchProductListingPageSettings(orgId: string): Promise<SystemPageSettingsPublic | null> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/products/page-settings`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** SEO/OG/Favicon/Scripts/Styles for the /blog system page, set via CMS → Page Settings. */
async function fetchBlogListingPageSettings(orgId: string): Promise<SystemPageSettingsPublic | null> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/blogs/page-settings`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchSystemPageSettings(orgId: string, pageType: SystemPageType): Promise<SystemPageSettingsPublic | null> {
  // cart/checkout/account have no dedicated Page Settings row (and shouldn't
  // silently inherit the shop page's custom CSS/scripts/SEO) — only
  // product-listing and blog-listing have a settings mechanism today.
  if (pageType === "blog-listing") return fetchBlogListingPageSettings(orgId);
  if (pageType === "product-listing") return fetchProductListingPageSettings(orgId);
  return null;
}

const SYSTEM_PAGE_DEFAULT_TITLES: Partial<Record<SystemPageType, string>> = {
  "blog-listing": "Blog",
  cart: "Cart",
  checkout: "Checkout",
  account: "My Account",
};

/** A single published post for /blog/[slug] — null if not found/not public. */
async function fetchBlogDetail(orgId: string, slug: string): Promise<PublicBlogDetailPost | null> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/blogs/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

/** Builds full SEO/OG/Twitter/favicon metadata for a regular CMS page (or the landing page). */
function buildPageMetadata(page: CmsPage, orgName: string): Metadata {
  const title = `${page.title} — ${orgName}`;
  const description = page.metaDesc ?? undefined;
  return {
    title,
    description,
    keywords: page.metaKeywords ?? undefined,
    robots: page.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.ogTitle || title,
      description: page.ogDescription || description,
      type: (page.ogType as "website" | "article") || "website",
      url: page.ogUrl ?? undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
    twitter: {
      card: page.twitterCardSize === "small" ? "summary" : "summary_large_image",
      title: page.twitterTitle || page.ogTitle || title,
      description: page.twitterDescription || page.ogDescription || description,
      images: (page.twitterImage || page.ogImage) ? [(page.twitterImage || page.ogImage) as string] : undefined,
    },
    icons: page.faviconUrl ? { icon: page.faviconUrl } : undefined,
  };
}

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

  const metadata = await resolvePageMetadata(org, slug);
  return org.googleSiteVerification
    ? { ...metadata, verification: { google: org.googleSiteVerification } }
    : metadata;
}

async function resolvePageMetadata(
  org: OrgInfo,
  slug: string[] | undefined,
): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("vyntra_site_lang")?.value;
  const activeLang = (lang && org.siteLanguages?.includes(lang)) ? lang : (org.defaultSiteLanguage ?? "en");

  const pageSlug = slug?.join("/");
  if (!pageSlug) {
    const landing = await fetchLandingPage(org.id, activeLang);
    return landing ? buildPageMetadata(landing, org.name) : { title: org.name };
  }

  const resolved = resolveSystemPageType(pageSlug);
  if (resolved) {
    if (resolved.pageType === "blog-detail" && resolved.param) {
      const post = await fetchBlogDetail(org.id, resolved.param);
      if (!post) return { title: org.name };
      const title = post.seoTitle || post.title;
      const description = post.metaDesc || post.excerpt || undefined;
      return {
        title: `${title} — ${org.name}`,
        description,
        keywords: post.keywords ?? undefined,
        openGraph: {
          title,
          description,
          type: "article",
          images: post.coverImage ? [post.coverImage] : undefined,
        },
      };
    }

    const settings = await fetchSystemPageSettings(org.id, resolved.pageType);
    const defaultTitle = `${SYSTEM_PAGE_DEFAULT_TITLES[resolved.pageType] ?? "Shop"} — ${org.name}`;
    const title = settings?.metaTitle || defaultTitle;
    const description = settings?.metaDesc ?? undefined;
    return {
      title,
      description,
      keywords: settings?.metaKeywords ?? undefined,
      robots: settings?.noIndex ? { index: false, follow: false } : undefined,
      openGraph: {
        title: settings?.ogTitle || title,
        description: settings?.ogDescription || description,
        type: (settings?.ogType as "website" | "article") || "website",
        url: settings?.ogUrl ?? undefined,
        images: settings?.ogImage ? [settings.ogImage] : undefined,
      },
      icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    };
  }

  const page = await fetchPage(org.id, pageSlug, activeLang);
  return page ? buildPageMetadata(page, org.name) : { title: org.name };
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

  // System routes (e.g. /shop, /blog, /blog/:slug) are app-driven, resolved before any CMS page lookup.
  const resolved = resolveSystemPageType(pageSlug);
  if (resolved) {
    const [layout, pageSettings] = await Promise.all([
      fetchSiteLayout(org.id),
      // blog-detail's SEO/etc comes from the post itself, not a Page Settings entry.
      resolved.pageType === "blog-detail" ? null : fetchSystemPageSettings(org.id, resolved.pageType),
    ]);
    return (
      <>
        <Head />
        <SystemPageView
          org={org}
          layout={layout}
          pageType={resolved.pageType}
          themeIdentifier={orgThemeIdentifier}
          pageSettings={pageSettings}
          slug={resolved.param}
        />
      </>
    );
  }

  const page = await fetchPage(org.id, pageSlug, activeLang);
  if (!page) notFound();
  const themeIdentifier = page.themeIdentifier ?? orgThemeIdentifier;
  const layout = await fetchSiteLayout(org.id, page.layoutId);
  return <><Head /><PageView org={org} page={page} layout={layout} themeIdentifier={themeIdentifier} /></>;
}
