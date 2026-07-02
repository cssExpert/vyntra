import type { ComponentType } from "react";
import type { SystemPageType } from "./systemPages";

import ShopingoProductListing from "./shopingo/pages/ProductListing";
import CommonProductListing from "./common/pages/ProductListing";

export interface SystemPageProps {
  orgId: string;
  themeIdentifier: string;
}

type AnySystemPage = ComponentType<SystemPageProps>;

const COMMON_SYSTEM_PAGES: Record<SystemPageType, AnySystemPage> = {
  "product-listing": CommonProductListing,
};

const THEME_SYSTEM_PAGES: Record<string, Partial<Record<SystemPageType, AnySystemPage>>> = {
  shopingo: {
    "product-listing": ShopingoProductListing,
  },
};

/** Returns the theme-specific system page component, falling back to common. */
export function resolveThemeSystemPage(
  pageType: SystemPageType,
  themeIdentifier = "shopingo",
): AnySystemPage {
  return THEME_SYSTEM_PAGES[themeIdentifier]?.[pageType] ?? COMMON_SYSTEM_PAGES[pageType];
}
