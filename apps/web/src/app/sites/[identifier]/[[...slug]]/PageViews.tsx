import { NodeRenderer } from "./NodeRenderer";
import { SiteNavbar, SiteFooter } from "./SiteLayout";

export interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
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

  if (nodes) {
    return (
      <div className="min-h-screen bg-white">
        {hasLayout && <SiteNavbar org={org} layout={layout} />}
        <NodeRenderer nodes={nodes} orgId={org.id} />
        {hasLayout && <SiteFooter org={org} layout={layout} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {hasLayout ? (
        <SiteNavbar org={org} layout={layout} />
      ) : (
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
      )}

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

      {hasLayout ? (
        <SiteFooter org={org} layout={layout} />
      ) : (
        <footer className="border-t border-gray-100 mt-24 py-10 text-center text-sm text-gray-400">
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {hasLayout ? (
        <SiteNavbar org={org} layout={layout} />
      ) : (
        <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <span className="text-lg font-bold tracking-tight text-gray-900">{org.name}</span>
          </div>
        </nav>
      )}

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

      {hasLayout ? (
        <SiteFooter org={org} layout={layout} />
      ) : (
        <footer className="border-t border-gray-100 mt-24 py-10 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {org.name}
        </footer>
      )}
    </div>
  );
}
