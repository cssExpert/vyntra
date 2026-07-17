import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomerJwtPayload } from '@vyntra/types';

/**
 * Cart/checkout routes must work for both guests (X-Cart-Token header) and
 * logged-in customers (Authorization bearer). This guard never rejects the
 * request — it just attempts to decode a storefront customer JWT if one is
 * present and attaches it to `request.customer`, so downstream handlers can
 * branch on identity without a hard auth requirement.
 */
@Injectable()
export class OptionalCustomerAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<CustomerJwtPayload>(token, {
          secret: this.config.get<string>('STOREFRONT_JWT_SECRET') ?? 'dev-storefront-secret',
        });
        if (payload.typ === 'storefront_customer') {
          request.customer = {
            id: payload.sub,
            organizationId: payload.organizationId,
            email: payload.email,
          };
        }
      } catch {
        // Invalid/expired token on a route that also allows guests — ignore
        // and fall through as an anonymous request rather than rejecting.
      }
    }

    return true;
  }
}
