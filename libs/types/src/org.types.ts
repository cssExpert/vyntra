// Organizations (tenants/companies) and their subscriptions.

import { BillingCycle } from './package.types';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface Subscription {
  id: string;
  organizationId: string;
  packageId: string;
  status: SubscriptionStatus;
  billingEmail?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  isActive: boolean;
  maxUsers: number;
  createdAt: string;
}

/** What an authenticated company member sees about their own org, including
 *  the resolved set of modules they're entitled to (from their package). */
export interface CurrentOrganization extends Organization {
  subscription?: {
    status: SubscriptionStatus;
    packageName: string;
    billingCycle: BillingCycle;
  } | null;
  modules: string[];
}
