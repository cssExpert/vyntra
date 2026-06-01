import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_KEY = 'superAdminOnly';

/** Restrict a route to platform super admins only (enforced by RolesGuard). */
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_KEY, true);
