import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
