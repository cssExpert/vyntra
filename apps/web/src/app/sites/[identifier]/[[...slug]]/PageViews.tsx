import type React from "react";
import { NodeRenderer } from "./NodeRenderer";
import { SiteNavbar, SiteFooter } from "./SiteLayout";

export interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  logoUrl: string | null;
  darkLogoUrl: string | null;
  themeSwitcherEnabled: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  publishedAt: string | null;
  updatedAt: string;
  layoutId?: string | null;
}

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  metaDesc: string | null;
  publishedAt: string | null;
}

export interface SiteLayoutData {
  navMenuId: string | null;
  footerColumns: { title: string; menuId: string }[];
  headerVariant: string;
  footerVariant: string;
}

function parseNodes(content: string | null) {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // legacy HTML content — handled separately
  }
  return null;
}

export async function PageView({
  org,
  page,
  layout,
  isLanding = false,
}: {
  org: OrgInfo;
  page: CmsPage;
  layout: SiteLayoutData;
  isLanding?: boolean;
}) {
  const nodes = parseNodes(page.content);
  const hasLayout = !!layout.navMenuId || layout.footerColumns.length > 0;

  const pageStyle = {
    backgroundColor: "var(--background, #ffffff)",
    color: "var(--foreground, #111827)",
  };

  if (nodes) {
    return (
      <div className="min-h-screen" style={pageStyle}>
        {hasLayout && <SiteNavbar org={org} layout={layout} />}
        <NodeRenderer nodes={nodes} orgId={org.id} />
        {hasLayout && <SiteFooter org={org} layout={layout} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={pageStyle}>
      {hasLayout ? (
        <SiteNavbar org={org} layout={layout} />
      ) : (
        <nav
          className="backdrop-blur-sm sticky top-0 z-50"
          style={{
            backgroundColor: "color-mix(in srgb, var(--background, #ffffff) 95%, transparent)",
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a
              href="/"
              className="text-lg font-bold tracking-tight transition-opacity hover:opacity-70"
              style={{ color: "var(--primary, #3b82f6)" }}
            >
              {org.name}
            </a>
            {!isLanding && (
              <a
                href="/"
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: "var(--muted-foreground, #6b7280)" }}
              >
                ← Home
              </a>
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
        <SiteFooter org={org} layout={layout} />
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

export async function SiteHome({
  org,
  pages,
  layout,
}: {
  org: OrgInfo;
  pages: PageListItem[];
  layout: SiteLayoutData;
}) {
  const hasLayout = !!layout.navMenuId || layout.footerColumns.length > 0;
  const pageStyle = {
    backgroundColor: "var(--background, #ffffff)",
    color: "var(--foreground, #111827)",
  };

  return (
    <div className="min-h-screen font-sans" style={pageStyle}>
      {hasLayout ? (
        <SiteNavbar org={org} layout={layout} />
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
        <SiteFooter org={org} layout={layout} />
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
