// Shared tag catalog is used across multiple features — keep this list in
// sync with any TagAssignment.entityType value written by another module.
export const TAGGABLE_TYPES = ['blog', 'product', 'page'] as const;
export type TagEntityType = (typeof TAGGABLE_TYPES)[number];
