import type { BlockType, BlockDataMap } from "./types";
import * as shopingo from "./shopingo/blockDefaults";
import * as academy from "./academy/blockDefaults";

export type BlockMeta = { label: string; description: string; icon: string };
export type BlockGroup = { label: string; types: BlockType[] };

// Shopingo's meta/defaults double as the "common" base for the original 14
// block types — every theme falls back to them unless it overrides a type.
const THEME_META: Record<string, Partial<Record<BlockType, BlockMeta>>> = {
  shopingo: shopingo.BLOCK_META,
  academy: academy.BLOCK_META,
};

const THEME_DEFAULTS: Record<string, Partial<BlockDataMap>> = {
  shopingo: shopingo.BLOCK_DEFAULTS,
  academy: academy.BLOCK_DEFAULTS as Partial<BlockDataMap>,
};

const THEME_GROUPS: Record<string, BlockGroup[]> = {
  shopingo: shopingo.BLOCK_GROUPS,
  academy: academy.BLOCK_GROUPS,
};

const THEME_LABELS: Record<string, string> = {
  shopingo: "Shopingo",
  academy: "Academy",
};

export function getBlockMeta(themeIdentifier: string): Record<BlockType, BlockMeta> {
  return { ...shopingo.BLOCK_META, ...(THEME_META[themeIdentifier] ?? {}) } as Record<BlockType, BlockMeta>;
}

export function getBlockDefaults(themeIdentifier: string): BlockDataMap {
  return { ...shopingo.BLOCK_DEFAULTS, ...(THEME_DEFAULTS[themeIdentifier] ?? {}) } as BlockDataMap;
}

export function getBlockGroups(themeIdentifier: string): BlockGroup[] {
  return THEME_GROUPS[themeIdentifier] ?? shopingo.BLOCK_GROUPS;
}

export function getThemeLabel(themeIdentifier: string): string {
  return THEME_LABELS[themeIdentifier] ?? "Theme";
}
