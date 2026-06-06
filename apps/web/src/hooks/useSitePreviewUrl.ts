"use client";

import { useState, useEffect } from "react";
import { orgDomain, type OrgDomain } from "@/lib/api";

function buildUrl(domain: OrgDomain, slug?: string): string | null {
  const platform =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "lvh.me";
  const port =
    typeof window !== "undefined" && window.location.port
      ? `:${window.location.port}`
      : "";
  const path = slug ? `/${slug}` : "";

  if (domain.customDomain && domain.customDomainVerified) {
    return `https://${domain.customDomain}${path}`;
  }
  if (domain.subdomain) {
    return `http://${domain.subdomain}.${platform}${port}${path}`;
  }
  return null;
}

/**
 * Fetches the current org's domain config and returns a helper that builds
 * public CMS site URLs (subdomain or custom domain).
 *
 * Usage:
 *   const { previewUrl, hasDomain } = useSitePreviewUrl();
 *   window.open(previewUrl("about"), "_blank");
 */
export function useSitePreviewUrl() {
  const [domain, setDomain] = useState<OrgDomain | null>(null);

  useEffect(() => {
    orgDomain.get().then(setDomain).catch(() => setDomain(null));
  }, []);

  function previewUrl(slug?: string): string | null {
    if (!domain) return null;
    return buildUrl(domain, slug);
  }

  const hasDomain = Boolean(
    domain?.subdomain ||
      (domain?.customDomain && domain?.customDomainVerified),
  );

  return { previewUrl, hasDomain };
}
