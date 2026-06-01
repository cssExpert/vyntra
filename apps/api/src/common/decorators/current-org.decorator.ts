import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/authenticated-user';

/** Inject the current organization id from the authenticated user. */
export const CurrentOrg = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user as AuthenticatedUser)?.organizationId ?? null;
  },
);
