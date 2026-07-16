import type React from "react";
import Link from "next/link";
import Script from "next/script";
import { NodeRenderer } from "./NodeRenderer";
import { SiteNavbar, SiteFooter } from "./SiteLayout";
import { BlockRenderer } from "./BlockRenderer";
import { parseTypedBlocks } from "@/lib/themes/parseTypedBlocks";
import { resolveThemeSystemPage } from "@/lib/themes/themeSystemPageResolver";
import type { SystemPageType } from "@/lib/themes/systemPages";

/** Injects the GA4 gtag.js snippet when the org has a Measurement/Container ID configured. */
function GoogleAnalytics({ gaId }: { gaId?: string | null }) {
  if (!gaId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

export interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  logoUrl: string | null;
  darkLogoUrl: string | null;
  themeSwitcherEnabled: boolean;
  siteLanguages: string[];
  defaultSiteLanguage: string;
  googleAnalyticsId?: string | null;
  googleSiteVerification?: string | null;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  noIndex?: boolean;
  publishedAt: string | null;
  updatedAt: string;
  layoutId?: string | null;
  themeIdentifier?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogType?: string;
  ogUrl?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterCardSize?: string;
  faviconUrl?: string | null;
  headScript?: string | null;
  bodyScript?: string | null;
  customCss?: string | null;
}

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  metaDesc: string | null;
  noIndex?: boolean;
  publishedAt: string | null;
  updatedAt?: string;
}

export interface SiteLayoutData {
  navMenuId: string | null;
  footerColumns: { title: string; menuId: string }[];
}

/** SEO/OG/Favicon/Scripts/Styles/page-size for a system page, set via CMS → Page Settings. */
export interface SystemPageSettingsPublic {
  metaTitle: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  noIndex: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogType: string;
  ogUrl: string | null;
  ogImage: string | null;
  faviconUrl: string | null;
  headScript: string | null;
  bodyScript: string | null;
  customCss: string | null;
  productsPerPage: number;
}

function parseLegacyNodes(content: string | null) {
  if (!content) return null;
  // Typed blocks (new format) are handled by BlockRenderer — skip them here
  if (parseTypedBlocks(content)) return null;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // plain HTML content
  }
  return null;
}

export async function PageView({
  org,
  page,
  layout,
  themeIdentifier = "shopingo",
  isLanding = false,
}: {
  org: OrgInfo;
  page: CmsPage;
  layout: SiteLayoutData;
  themeIdentifier?: string;
  isLanding?: boolean;
}) {
  const typedBlocks = parseTypedBlocks(page.content);
  const nodes = parseLegacyNodes(page.content);
  const hasLayout = !!layout.navMenuId || layout.footerColumns.length > 0;

  const pageStyle = {
    backgroundColor: "var(--background, #ffffff)",
    color: "var(--foreground, #111827)",
  };

  // New typed-block pages: full-width layout driven by blocks
  if (typedBlocks) {
    return (
      <div className="min-h-screen" style={pageStyle}>
        {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}
        {page.headScript && <script dangerouslySetInnerHTML={{ __html: page.headScript }} />}
        <GoogleAnalytics gaId={org.googleAnalyticsId} />
        <SiteNavbar org={org} layout={layout} themeIdentifier={themeIdentifier} />
        <BlockRenderer blocks={typedBlocks} themeIdentifier={themeIdentifier} orgId={org.id} />
        <SiteFooter org={org} layout={layout} themeIdentifier={themeIdentifier} />
        {page.bodyScript && <script dangerouslySetInnerHTML={{ __html: page.bodyScript }} />}
      </div>
    );
  }

  // Legacy EditorNode pages
  if (nodes) {
    return (
      <div className="min-h-screen" style={pageStyle}>
        {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}
        {page.headScript && <script dangerouslySetInnerHTML={{ __html: page.headScript }} />}
        <GoogleAnalytics gaId={org.googleAnalyticsId} />
        {hasLayout && <SiteNavbar org={org} layout={layout} themeIdentifier={themeIdentifier} />}
        <NodeRenderer nodes={nodes} orgId={org.id} themeIdentifier={themeIdentifier} />
        {hasLayout && <SiteFooter org={org} layout={layout} themeIdentifier={themeIdentifier} />}
        {page.bodyScript && <script dangerouslySetInnerHTML={{ __html: page.bodyScript }} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={pageStyle}>
      {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}
      {page.headScript && <script dangerouslySetInnerHTML={{ __html: page.headScript }} />}
      <GoogleAnalytics gaId={org.googleAnalyticsId} />
      {hasLayout ? (
        <SiteNavbar org={org} layout={layout} themeIdentifier={themeIdentifier} />
      ) : (
        <nav
          className="backdrop-blur-sm sticky top-0 z-50"
          style={{
            backgroundColor: "color-mix(in srgb, var(--background, #ffffff) 95%, transparent)",
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight transition-opacity hover:opacity-70"
              style={{ color: "var(--primary, #3b82f6)" }}
            >
              {org.name}
            </Link>
            {!isLanding && (
              <Link
                href="/"
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: "var(--muted-foreground, #6b7280)" }}
              >
                ← Home
              </Link>
            )}
          </div>
        </nav>
      )}

      <main className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1
            className="text-4xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--foreground, #111827)" }}
          >
            {page.title}
          </h1>
          {page.metaDesc && (
            <p className="mt-4 text-xl leading-relaxed" style={{ color: "var(--muted-foreground, #6b7280)" }}>
              {page.metaDesc}
            </p>
          )}
          {page.publishedAt && (
            <p className="mt-4 text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>
              {new Date(page.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>
        <article
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md"
          style={{ "--tw-prose-body": "var(--foreground)", "--tw-prose-headings": "var(--foreground)", "--tw-prose-links": "var(--primary)" } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
        />
      </main>

      {hasLayout ? (
        <SiteFooter org={org} layout={layout} themeIdentifier={themeIdentifier} />
      ) : (
        <footer
          className="mt-24 py-10 text-center text-sm"
          style={{
            borderTop: "1px solid var(--border, #e5e7eb)",
            color: "var(--muted-foreground, #9ca3af)",
          }}
        >
          © {new Date().getFullYear()} {org.name}
        </footer>
      )}
      {page.bodyScript && <script dangerouslySetInnerHTML={{ __html: page.bodyScript }} />}
    </div>
  );
}

/** Renders an app-driven system page (e.g. /shop) with the site's normal nav/footer chrome. */
export async function SystemPageView({
  org,
  layout,
  pageType,
  themeIdentifier = "shopingo",
  pageSettings,
  slug,
}: {
  org: OrgInfo;
  layout: SiteLayoutData;
  pageType: SystemPageType;
  themeIdentifier?: string;
  pageSettings?: SystemPageSettingsPublic | null;
  /** Extra path segment for detail-style system pages, e.g. the blog post slug for "blog-detail". */
  slug?: string;
}) {
  const SystemPage = resolveThemeSystemPage(pageType, themeIdentifier);
  const pageStyle = {
    backgroundColor: "var(--background, #ffffff)",
    color: "var(--foreground, #111827)",
  };

  return (
    <div className="min-h-screen" style={pageStyle}>
      {pageSettings?.customCss && <style dangerouslySetInnerHTML={{ __html: pageSettings.customCss }} />}
      {pageSettings?.headScript && <script dangerouslySetInnerHTML={{ __html: pageSettings.headScript }} />}
      <GoogleAnalytics gaId={org.googleAnalyticsId} />
      <SiteNavbar org={org} layout={layout} themeIdentifier={themeIdentifier} />
      <SystemPage orgId={org.id} themeIdentifier={themeIdentifier} slug={slug} />
      <SiteFooter org={org} layout={layout} themeIdentifier={themeIdentifier} />
      {pageSettings?.bodyScript && <script dangerouslySetInnerHTML={{ __html: pageSettings.bodyScript }} />}
    </div>
  );
}

export async function SiteHome({
  org,
  pages,
  layout,
  themeIdentifier = "shopingo",
}: {
  org: OrgInfo;
  pages: PageListItem[];
  layout: SiteLayoutData;
  themeIdentifier?: string;
}) {
  const hasLayout = !!layout.navMenuId || layout.footerColumns.length > 0;
  const pageStyle = {
    backgroundColor: "var(--background, #ffffff)",
    color: "var(--foreground, #111827)",
  };

  return (
    <div className="min-h-screen font-sans" style={pageStyle}>
      <GoogleAnalytics gaId={org.googleAnalyticsId} />
      {hasLayout ? (
        <SiteNavbar org={org} layout={layout} themeIdentifier={themeIdentifier} />
      ) : (
        <nav
          className="backdrop-blur-sm sticky top-0 z-50"
          style={{
            backgroundColor: "color-mix(in srgb, var(--background, #ffffff) 95%, transparent)",
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--primary, #3b82f6)" }}
            >
              {org.name}
            </span>
          </div>
        </nav>
      )}

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-12" style={{ color: "var(--foreground, #111827)" }}>
          {org.name}
        </h1>
        {pages.length === 0 ? (
          <p style={{ color: "var(--muted-foreground, #9ca3af)" }}>No published pages yet.</p>
        ) : (
          <ul style={{ borderColor: "var(--border, #f3f4f6)" }} className="divide-y">
            {pages.map((p) => (
              <li key={p.id} className="py-8">
                <a href={`/${p.slug}`} className="group block">
                  <h2
                    className="text-2xl font-semibold transition-opacity group-hover:opacity-70"
                    style={{ color: "var(--foreground, #111827)" }}
                  >
                    {p.title}
                  </h2>
                  {p.metaDesc && (
                    <p className="mt-2 leading-relaxed line-clamp-2" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                      {p.metaDesc}
                    </p>
                  )}
                  {p.publishedAt && (
                    <p className="mt-3 text-sm" style={{ color: "var(--muted-foreground, #9ca3af)" }}>
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

      {hasLayout ? (
        <SiteFooter org={org} layout={layout} themeIdentifier={themeIdentifier} />
      ) : (
        <footer
          className="mt-24 py-10 text-center text-sm"
          style={{
            borderTop: "1px solid var(--border, #e5e7eb)",
            color: "var(--muted-foreground, #9ca3af)",
          }}
        >
          © {new Date().getFullYear()} {org.name}
        </footer>
      )}
    </div>
  );
}
