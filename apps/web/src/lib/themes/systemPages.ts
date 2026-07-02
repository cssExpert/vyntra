// System pages are app-driven storefront routes (product listing, product detail, …)
// as opposed to CMS pages, which are admin-authored content. They live at a fixed
// set of reserved slugs so they never collide with a CMS page's slug — the catch-all
// site route checks this map before falling back to a CMS page lookup, and CMS page
// creation rejects any slug found here.

export type SystemPageType = "product-listing";

/** slug (no leading slash) → system page type. Extend here for /cart, /checkout, etc. */
export const SYSTEM_PAGE_ROUTES: Record<string, SystemPageType> = {
  products: "product-listing",
};

export const RESERVED_SYSTEM_SLUGS = Object.keys(SYSTEM_PAGE_ROUTES);

export function resolveSystemPageType(pageSlug: string): SystemPageType | null {
  return SYSTEM_PAGE_ROUTES[pageSlug] ?? null;
}
