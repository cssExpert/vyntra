import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomerJwtPayload } from '@vyntra/types';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Cart/checkout/catalog routes must work for both guests (X-Cart-Token header,
 * or no identity at all) and logged-in customers (Authorization bearer). This
 * guard never rejects the request — it just attempts to decode a storefront
 * customer JWT if one is present and attaches it to `request.customer`, so
 * downstream handlers can branch on identity (and customer-group restrictions)
 * without a hard auth requirement.
 */
@Injectable()
export class OptionalCustomerAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
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
          const customer = await this.prisma.storeCustomer.findUnique({
            where: { id: payload.sub },
            select: { customerGroupId: true },
          });
          request.customer = {
            id: payload.sub,
            organizationId: payload.organizationId,
            email: payload.email,
            customerGroupId: customer?.customerGroupId ?? null,
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
