// Packages (plans) and the modules they entitle a company to use.

/** Known platform modules. Stored in the DB so new ones can be added without code changes,
 *  but these keys are the contract the frontend gates navigation on. */
export enum ModuleKey {
  CMS = 'CMS',
  CRM = 'CRM',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  LIFETIME = 'LIFETIME',
}

export interface PlatformModule {
  id: string;
  key: string; // ModuleKey, but kept open for DB-defined modules
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  billingCycle: BillingCycle;
  maxUsers: number;
  isActive: boolean;
  /** Visible for self-signup once that flow ships. */
  isPublic: boolean;
  /** Module keys this package grants access to. */
  modules: string[];
}
