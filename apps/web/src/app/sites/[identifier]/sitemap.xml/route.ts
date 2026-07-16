import { NextResponse, type NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PublicPage {
  slug: string;
  noIndex?: boolean;
  updatedAt?: string;
}

interface PublicBlogPost {
  slug: string;
  publishedAt: string | null;
}

async function resolveOrgId(identifier: string, chost: string | null): Promise<string | null> {
  try {
    const url =
      identifier === "_host" && chost
        ? `${API}/public/resolve-domain?domain=${encodeURIComponent(chost)}`
        : `${API}/public/resolve-subdomain/${encodeURIComponent(identifier)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const org = (await res.json()) as { id: string };
    return org.id;
  } catch {
    return null;
  }
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc: string, lastmod?: string | null): string {
  const iso = lastmod ? new Date(lastmod).toISOString() : undefined;
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${iso ? `\n    <lastmod>${iso}</lastmod>` : ""}\n  </url>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const { identifier } = await params;
  const chost = request.nextUrl.searchParams.get("_chost");
  const orgId = await resolveOrgId(identifier, chost);
  if (!orgId) return new NextResponse("Not found", { status: 404 });

  const origin = request.nextUrl.origin;

  const [pagesRes, blogsRes] = await Promise.all([
    fetch(`${API}/public/sites/${orgId}/pages`, { cache: "no-store" }),
    fetch(`${API}/public/sites/${orgId}/blogs?take=1000`, { cache: "no-store" }),
  ]);
  const pages: PublicPage[] = pagesRes.ok ? await pagesRes.json() : [];
  const blogsPayload = blogsRes.ok ? await blogsRes.json() : { data: [] };
  const posts: PublicBlogPost[] = blogsPayload.data ?? [];

  const entries = [
    urlEntry(origin),
    urlEntry(`${origin}/shop`),
    urlEntry(`${origin}/blog`),
    ...pages.filter((p) => !p.noIndex).map((p) => urlEntry(`${origin}/${p.slug}`, p.updatedAt)),
    ...posts.map((b) => urlEntry(`${origin}/blog/${b.slug}`, b.publishedAt)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
