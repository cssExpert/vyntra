import type { ComponentType } from "react";
import type { SystemPageType } from "./systemPages";

import ShopingoProductListing from "./shopingo/pages/ProductListing";
import CommonProductListing from "./common/pages/ProductListing";
import ShopingoProductDetail from "./shopingo/pages/ProductDetail";
import CommonProductDetail from "./common/pages/ProductDetail";
import ShopingoBlogListing from "./shopingo/pages/BlogListing";
import CommonBlogListing from "./common/pages/BlogListing";
import ShopingoBlogDetail from "./shopingo/pages/BlogDetail";
import CommonBlogDetail from "./common/pages/BlogDetail";

export interface SystemPageProps {
  orgId: string;
  themeIdentifier: string;
  /** Extra path segment for detail-style system pages, e.g. the blog post slug for "blog-detail". */
  slug?: string;
}

type AnySystemPage = ComponentType<SystemPageProps>;

const COMMON_SYSTEM_PAGES: Record<SystemPageType, AnySystemPage> = {
  "product-listing": CommonProductListing,
  "product-detail":  CommonProductDetail,
  "blog-listing":    CommonBlogListing,
  "blog-detail":     CommonBlogDetail,
};

const THEME_SYSTEM_PAGES: Record<string, Partial<Record<SystemPageType, AnySystemPage>>> = {
  shopingo: {
    "product-listing": ShopingoProductListing,
    "product-detail":  ShopingoProductDetail,
    "blog-listing":    ShopingoBlogListing,
    "blog-detail":     ShopingoBlogDetail,
  },
};

/** Returns the theme-specific system page component, falling back to common. */
export function resolveThemeSystemPage(
  pageType: SystemPageType,
  themeIdentifier = "shopingo",
): AnySystemPage {
  return THEME_SYSTEM_PAGES[themeIdentifier]?.[pageType] ?? COMMON_SYSTEM_PAGES[pageType];
}
