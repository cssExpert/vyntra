import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator';
import { AuthenticatedUser } from '../types/authenticated-user';

/**
 * Enforces @SuperAdminOnly() and @Roles(...). Super admins bypass role checks.
 * Runs after the global JwtAuthGuard, so request.user is populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const superAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!superAdminOnly && (!requiredRoles || requiredRoles.length === 0)) {
      return true; // no role constraint on this route
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) throw new ForbiddenException('Not authenticated');

    if (user.superAdmin) return true; // super admin can do anything

    if (superAdminOnly) {
      throw new ForbiddenException('Super admin access required');
    }

    const hasRole = user.roles?.some((r) => requiredRoles.includes(r));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return true;
  }
}
