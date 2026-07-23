import { SHOPINGO_PAGE_DEFAULTS } from "./shopingo/pageDefaults";
import { ACADEMY_PAGE_DEFAULTS } from "./academy/pageDefaults";

type SeedBlock = { id: string; type: string; data: Record<string, unknown> };

// Registry: theme identifier → page defaults map
const THEME_PAGE_DEFAULTS: Record<string, Record<string, SeedBlock[]>> = {
  shopingo: SHOPINGO_PAGE_DEFAULTS,
  academy: ACADEMY_PAGE_DEFAULTS,
};

export function getThemePageDefaults(themeIdentifier: string): Record<string, SeedBlock[]> {
  return THEME_PAGE_DEFAULTS[themeIdentifier.toLowerCase()] ?? {};
}
