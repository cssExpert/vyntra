// System pages are app-driven storefront routes (product listing, product detail, …)
// as opposed to CMS pages, which are admin-authored content. They live at a fixed
// set of reserved slugs so they never collide with a CMS page's slug — the catch-all
// site route checks this map before falling back to a CMS page lookup, and CMS page
// creation rejects any slug found here.

export type SystemPageType =
  | "product-listing"
  | "product-detail"
  | "blog-listing"
  | "blog-detail"
  | "cart"
  | "checkout"
  | "account";

/** slug (no leading slash) → system page type. */
export const SYSTEM_PAGE_ROUTES: Record<string, SystemPageType> = {
  shop: "product-listing",
  blog: "blog-listing",
  cart: "cart",
  checkout: "checkout",
  account: "account",
};

export const RESERVED_SYSTEM_SLUGS = Object.keys(SYSTEM_PAGE_ROUTES);

export interface ResolvedSystemPage {
  pageType: SystemPageType;
  /** Extra path segment for detail-style system pages, e.g. the post slug for "blog-detail". */
  param?: string;
}

/**
 * Resolves a full path (e.g. "blog", "blog/my-post-slug") to a system page.
 * Static routes match SYSTEM_PAGE_ROUTES exactly; "blog/:slug" resolves to the
 * blog-detail system page with the slug carried in `param`.
 */
export function resolveSystemPageType(pageSlug: string): ResolvedSystemPage | null {
  const staticType = SYSTEM_PAGE_ROUTES[pageSlug];
  if (staticType) return { pageType: staticType };

  const blogDetailMatch = pageSlug.match(/^blog\/([^/]+)$/);
  if (blogDetailMatch) return { pageType: "blog-detail", param: blogDetailMatch[1] };

  const productDetailMatch = pageSlug.match(/^shop\/([^/]+)$/);
  if (productDetailMatch) return { pageType: "product-detail", param: productDetailMatch[1] };

  // "account/orders", "account/orders/:id", "account/addresses" — the sub-view
  // (and optional id) is carried in `param` as "orders" / "orders/abc123".
  const accountMatch = pageSlug.match(/^account\/([^/]+(?:\/[^/]+)?)$/);
  if (accountMatch) return { pageType: "account", param: accountMatch[1] };

  return null;
}
