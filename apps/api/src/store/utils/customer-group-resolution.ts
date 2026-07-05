export type RestrictionMode = 'all' | 'only_selected' | 'except_selected';

export interface VisibilityOptions {
  /** Products-only: regex tested against name/SKU, OR'd with the manual selected-id list. */
  pattern?: string | null;
  patternCandidates?: string[];
}

/**
 * Shared visibility rule for all six restriction areas (categories, products, pages,
 * payment methods, shipping methods, online gateways).
 *
 * "only_selected" with an empty list (and no pattern match) resolves to "show nothing" —
 * not "show everything". This is the opposite of what a naive `.includes()` check defaults
 * to, so it's called out explicitly rather than left implicit.
 */
export function resolveVisibility(
  mode: RestrictionMode,
  selectedIds: string[],
  itemId: string,
  options?: VisibilityOptions,
): boolean {
  const patternMatches =
    !!options?.pattern &&
    (options.patternCandidates ?? []).some((candidate) =>
      new RegExp(options.pattern!, 'i').test(candidate),
    );

  if (mode === 'all') return true;

  if (mode === 'only_selected') {
    return selectedIds.includes(itemId) || patternMatches;
  }

  // except_selected: pattern is not evaluated here — it only ever adds visibility
  // under only_selected, it never adds an exclusion under except_selected.
  return !selectedIds.includes(itemId);
}

export interface TierPriceRow {
  minQty: number;
  price: number;
  customerGroupId: string | null;
}

/**
 * Resolve the effective tier price for a given quantity + customer group.
 * Walks minQty thresholds from highest to lowest; at each threshold prefers a row
 * scoped to the exact customer group over a row with customerGroupId = null
 * (applies to any group). Returns the first threshold whose price beats basePrice,
 * or null if none qualify.
 */
export function resolveTierPrice(
  rows: TierPriceRow[],
  qty: number,
  customerGroupId: string | null,
  basePrice: number,
): number | null {
  const eligible = rows.filter((row) => row.minQty <= qty);
  const thresholds = [...new Set(eligible.map((row) => row.minQty))].sort((a, b) => b - a);

  for (const threshold of thresholds) {
    const atThreshold = eligible.filter((row) => row.minQty === threshold);
    const exact = atThreshold.find((row) => row.customerGroupId === customerGroupId);
    const wildcard = atThreshold.find((row) => row.customerGroupId === null);
    const row = exact ?? wildcard;
    if (row && row.price < basePrice) return row.price;
  }

  return null;
}

/**
 * Tier price replaces the flat group discount entirely — the two never stack.
 */
export function resolveEffectivePrice(
  basePrice: number,
  tierPrice: number | null,
  discountType: 'percentage' | 'fixed' | null | undefined,
  discountValue: number | null | undefined,
): number {
  if (tierPrice !== null) return tierPrice;
  if (!discountType || discountValue == null) return basePrice;
  return discountType === 'percentage'
    ? basePrice * (1 - discountValue / 100)
    : Math.max(0, basePrice - discountValue);
}
