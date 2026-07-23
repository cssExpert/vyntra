// Theme registry — maps identifier strings to metadata.
// Block renderers (Header, Footer, block components) are added in Phase 4
// when Shopingo components are built.

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

export const ThemeRegistry: Record<string, ThemeDefinition> = {
  shopingo: {
    id: "shopingo",
    name: "Shopingo",
    description:
      "A modern ecommerce theme with dark utility bar, tabbed product sections, category grid, and brand carousel.",
  },
  academy: {
    id: "academy",
    name: "Academy",
    description:
      "A premium, faith-grounded private school theme — hero banners, admissions steps, faculty grids, and tuition tiers.",
  },
};

export function getTheme(identifier: string): ThemeDefinition {
  return ThemeRegistry[identifier] ?? ThemeRegistry.shopingo;
}
