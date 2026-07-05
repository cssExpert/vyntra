import {
  resolveVisibility,
  resolveTierPrice,
  resolveEffectivePrice,
} from './customer-group-resolution';

describe('resolveVisibility', () => {
  it('only_selected with empty list and no pattern returns false, not true', () => {
    expect(resolveVisibility('only_selected', [], 'prod-1')).toBe(false);
  });

  it('only_selected with empty list falls back to a matching pattern', () => {
    expect(
      resolveVisibility('only_selected', [], 'prod-1', {
        pattern: 'SKU-1',
        patternCandidates: ['SKU-123'],
      }),
    ).toBe(true);
  });

  it('only_selected with a non-matching pattern still honors the manual list', () => {
    expect(
      resolveVisibility('only_selected', ['prod-1'], 'prod-1', {
        pattern: 'NO-MATCH',
        patternCandidates: ['SKU-123'],
      }),
    ).toBe(true);
  });

  it('except_selected excludes listed items and ignores pattern entirely', () => {
    expect(resolveVisibility('except_selected', ['prod-1'], 'prod-1')).toBe(false);
    expect(
      resolveVisibility('except_selected', ['prod-1'], 'prod-2', {
        pattern: 'SKU',
        patternCandidates: ['SKU-2'],
      }),
    ).toBe(true);
  });

  it('all mode is always visible regardless of list or pattern', () => {
    expect(resolveVisibility('all', [], 'prod-1')).toBe(true);
    expect(resolveVisibility('all', ['prod-9'], 'prod-1')).toBe(true);
  });
});

describe('resolveTierPrice', () => {
  it('prefers the exact-group row over the null-group row at the same threshold', () => {
    const rows = [
      { minQty: 10, price: 90, customerGroupId: null },
      { minQty: 10, price: 80, customerGroupId: 'group-1' },
    ];
    expect(resolveTierPrice(rows, 10, 'group-1', 100)).toBe(80);
  });

  it('evaluates the highest qualifying threshold first, not the cheapest overall', () => {
    const rows = [
      { minQty: 5, price: 70, customerGroupId: 'group-1' },
      { minQty: 10, price: 85, customerGroupId: null },
    ];
    // qty=10 qualifies for both thresholds; minQty=10 must be evaluated first
    // and returned since it beats basePrice, even though minQty=5 is cheaper.
    expect(resolveTierPrice(rows, 10, 'group-1', 100)).toBe(85);
  });

  it('falls through to the next lower threshold when a threshold price does not beat base price', () => {
    const rows = [
      { minQty: 10, price: 120, customerGroupId: null }, // not cheaper than basePrice
      { minQty: 5, price: 90, customerGroupId: null },
    ];
    expect(resolveTierPrice(rows, 10, 'group-1', 100)).toBe(90);
  });

  it('returns null when no threshold qualifies', () => {
    const rows = [{ minQty: 10, price: 50, customerGroupId: null }];
    expect(resolveTierPrice(rows, 5, 'group-1', 100)).toBeNull();
  });
});

describe('resolveEffectivePrice', () => {
  it('tier price wins outright and never stacks with a flat discount', () => {
    expect(resolveEffectivePrice(100, 80, 'percentage', 20)).toBe(80);
  });

  it('applies a percentage discount when there is no tier price', () => {
    expect(resolveEffectivePrice(100, null, 'percentage', 25)).toBe(75);
  });

  it('applies a fixed discount when there is no tier price', () => {
    expect(resolveEffectivePrice(100, null, 'fixed', 30)).toBe(70);
  });

  it('clamps a fixed discount exceeding base price to zero, never negative', () => {
    expect(resolveEffectivePrice(100, null, 'fixed', 150)).toBe(0);
  });

  it('returns base price unchanged when no tier and no discount are configured', () => {
    expect(resolveEffectivePrice(100, null, null, null)).toBe(100);
  });
});
