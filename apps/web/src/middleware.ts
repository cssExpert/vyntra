import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "vyntra.com";

// Comma-separated list of hostnames that serve the admin dashboard.
// e.g. NEXT_PUBLIC_APP_DOMAIN=app.vyntra.com,admin.vyntra.com
const APP_DOMAINS: Set<string> = new Set(
  (process.env.NEXT_PUBLIC_APP_DOMAIN || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
);

/** Returns true if this hostname belongs to the admin dashboard and should NOT
 *  be treated as a customer CMS site. */
function isAppDomain(hostname: string): boolean {
  if (hostname === "localhost") return true;
  if (hostname === PLATFORM_DOMAIN) return true;           // bare platform domain
  if (hostname === `app.${PLATFORM_DOMAIN}`) return true;  // app.vyntra.com
  if (APP_DOMAINS.has(hostname)) return true;              // any configured admin domain
  return false;
}

export function middleware(request: NextRequest) {
  // Strip port number to get the bare hostname
  const hostname = (request.headers.get("host") || "").split(":")[0];
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Dashboard / admin portal — serve as-is, no rewriting
  if (isAppDomain(hostname)) {
    return NextResponse.next();
  }

  // Local subdomain: bloom.localhost → rewrite to /sites/bloom/...
  // Works in Chrome/Edge natively; other browsers may need lvh.me instead.
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.slice(0, hostname.length - ".localhost".length);
    if (subdomain && subdomain !== "app" && subdomain !== "www") {
      const url = request.nextUrl.clone();
      url.pathname = `/sites/${subdomain}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Platform subdomain: acme.vyntra.com → rewrite to /sites/acme/...
  if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = hostname.slice(
      0,
      hostname.length - PLATFORM_DOMAIN.length - 1,
    );
    // Skip reserved subdomains
    if (subdomain && subdomain !== "app" && subdomain !== "www") {
      const url = request.nextUrl.clone();
      url.pathname = `/sites/${subdomain}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Custom domain: acme.com → rewrite to /sites/_host/...?_chost=acme.com
  const url = request.nextUrl.clone();
  url.pathname = `/sites/_host${pathname === "/" ? "" : pathname}`;
  url.searchParams.set("_chost", hostname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
