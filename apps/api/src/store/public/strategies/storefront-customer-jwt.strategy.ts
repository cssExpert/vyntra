import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomerJwtPayload } from '@vyntra/types';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Separate Passport strategy for storefront (shopper) sessions — registered
 * under a distinct name so it can never be picked up by the global staff
 * JwtAuthGuard (which uses Passport's default 'jwt' strategy name), and
 * signed with STOREFRONT_JWT_SECRET (never the staff JWT_SECRET) so a staff
 * token can never verify here and vice versa.
 */
@Injectable()
export class StorefrontCustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'storefront-customer-jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('STOREFRONT_JWT_SECRET') ?? 'dev-storefront-secret',
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (payload.typ !== 'storefront_customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const customer = await this.prisma.storeCustomer.findUnique({
      where: { id: payload.sub },
    });

    if (!customer || customer.organizationId !== payload.organizationId) {
      throw new UnauthorizedException('Customer not found');
    }

    return {
      id: customer.id,
      organizationId: customer.organizationId,
      email: customer.email,
      name: customer.name,
    };
  }
}
