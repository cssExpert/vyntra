"use client";

import { useState, useEffect } from "react";
import { orgDomain, apiGetMyOrg, type OrgDomain } from "@/lib/api";

const PLATFORM =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PLATFORM_DOMAIN) ||
  "lvh.me";

function buildUrl(
  domain: OrgDomain | null,
  orgSlug: string,
  slug?: string,
): string | null {
  const path = slug ? `/${slug}` : "";

  if (domain?.customDomain && domain.customDomainVerified) {
    return `https://${domain.customDomain}${path}`;
  }

  if (domain?.subdomain) {
    const port =
      typeof window !== "undefined" && window.location.port
        ? `:${window.location.port}`
        : "";
    return `http://${domain.subdomain}.${PLATFORM}${port}${path}`;
  }

  // Fallback: route via the internal /sites/[orgSlug] Next.js route.
  // resolveBySubdomain on the API now also matches by org slug, so this
  // works locally without needing a subdomain configured.
  if (orgSlug) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    return `${origin}/sites/${orgSlug}${path}`;
  }

  return null;
}

export function useSitePreviewUrl() {
  const [domain, setDomain] = useState<OrgDomain | null>(null);
  const [orgSlug, setOrgSlug] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      orgDomain.get().catch(() => null),
      apiGetMyOrg().catch(() => null),
    ]).then(([d, org]) => {
      setDomain(d);
      setOrgSlug(org?.slug ?? "");
      setReady(true);
    });
  }, []);

  function previewUrl(slug?: string): string | null {
    if (!ready) return null;
    return buildUrl(domain, orgSlug, slug);
  }

  const hasDomain = Boolean(
    domain?.subdomain ||
      (domain?.customDomain && domain?.customDomainVerified),
  );

  return { previewUrl, hasDomain, ready };
}
