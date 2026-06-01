import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleKey } from '@vyntra/types';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';
import { AuthenticatedUser } from '../types/authenticated-user';

/**
 * Gates a route behind a module entitlement: the current org's active package
 * must include the required module. Super admins bypass. This is what enforces
 * "a company can only access the modules in its package".
 */
@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<ModuleKey>(
      REQUIRE_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.superAdmin) return true;

    if (!user.organizationId) {
      throw new ForbiddenException('No organization context');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
      include: { package: { include: { modules: { include: { module: true } } } } },
    });

    const active =
      subscription &&
      ['ACTIVE', 'TRIALING'].includes(subscription.status) &&
      subscription.package.isActive;

    const hasModule =
      active &&
      subscription!.package.modules.some(
        (pm) => pm.module.key === required && pm.module.isActive,
      );

    if (!hasModule) {
      throw new ForbiddenException(
        `Your plan does not include the ${required} module`,
      );
    }
    return true;
  }
}
