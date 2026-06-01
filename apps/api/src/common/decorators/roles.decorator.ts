import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restrict a route to the given org roles (enforced by RolesGuard). Super admins always pass. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
