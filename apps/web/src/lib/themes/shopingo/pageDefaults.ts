import { BLOCK_DEFAULTS } from "./blockDefaults";

// TypedBlock shape (matches parseTypedBlocks + BlockRenderer expectation)
type SeedBlock = { id: string; type: string; data: Record<string, unknown> };

function b(id: string, type: string, data: Record<string, unknown>): SeedBlock {
  return { id, type, data };
}

export const SHOPINGO_PAGE_DEFAULTS: Record<string, SeedBlock[]> = {
  home: [
    b("hc1", "hero-carousel", BLOCK_DEFAULTS["hero-carousel"] as unknown as Record<string, unknown>),
    b("fb1", "features-banner", BLOCK_DEFAULTS["features-banner"] as unknown as Record<string, unknown>),
    b("pt1", "product-tabs", BLOCK_DEFAULTS["product-tabs"] as unknown as Record<string, unknown>),
    b("cg1", "category-grid", BLOCK_DEFAULTS["category-grid"] as unknown as Record<string, unknown>),
    b("pg1", "product-grid", BLOCK_DEFAULTS["product-grid"] as unknown as Record<string, unknown>),
    b("pb1", "promo-banner", BLOCK_DEFAULTS["promo-banner"] as unknown as Record<string, unknown>),
    b("bc1", "brand-carousel", BLOCK_DEFAULTS["brand-carousel"] as unknown as Record<string, unknown>),
    b("bs1", "blog-section", BLOCK_DEFAULTS["blog-section"] as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
  shop: [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "Shop",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Shop", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("pg1", "product-grid", {
      ...BLOCK_DEFAULTS["product-grid"],
      title: "All Products",
    } as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
  "about-us": [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "About Us",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "About Us", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("ti1", "text-image", BLOCK_DEFAULTS["text-image"] as unknown as Record<string, unknown>),
    b("fb1", "features-banner", BLOCK_DEFAULTS["features-banner"] as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
  "contact-us": [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "Contact Us",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Contact Us", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("fb1", "features-banner", BLOCK_DEFAULTS["features-banner"] as unknown as Record<string, unknown>),
    b("cfi1", "contact-form-info", BLOCK_DEFAULTS["contact-form-info"] as unknown as Record<string, unknown>),
    b("gm1", "google-map", BLOCK_DEFAULTS["google-map"] as unknown as Record<string, unknown>),
  ],
  blog: [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "Blog",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Blog", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("bs1", "blog-section", BLOCK_DEFAULTS["blog-section"] as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
};

// Registry: theme identifier → page defaults map
const THEME_PAGE_DEFAULTS: Record<string, Record<string, SeedBlock[]>> = {
  shopingo: SHOPINGO_PAGE_DEFAULTS,
};

export function getThemePageDefaults(themeIdentifier: string): Record<string, SeedBlock[]> {
  return THEME_PAGE_DEFAULTS[themeIdentifier.toLowerCase()] ?? {};
}
