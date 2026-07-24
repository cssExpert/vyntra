// Ported from apps/web/src/modules/store/store.constants.ts / store.utils.ts
// (admin store module) so the storefront's tier math stays identical to the
// admin dashboard's, without importing across the admin/storefront boundary.

export const REWARD_TIERS = ["platinum", "gold", "silver", "bronze"] as const;
export type RewardTier = (typeof REWARD_TIERS)[number];

export const REWARD_TIER_THRESHOLDS: Record<RewardTier, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
};

export function rewardTierForPoints(points: number): RewardTier {
  for (const tier of REWARD_TIERS) {
    if (points >= REWARD_TIER_THRESHOLDS[tier]) return tier;
  }
  return "bronze";
}

export function pointsToNextTier(points: number): { nextTier: RewardTier | null; remaining: number } {
  const tier = rewardTierForPoints(points);
  const tierIndex = REWARD_TIERS.indexOf(tier);
  const nextTier = tierIndex > 0 ? REWARD_TIERS[tierIndex - 1] : null;
  return { nextTier, remaining: nextTier ? REWARD_TIER_THRESHOLDS[nextTier] - points : 0 };
}
