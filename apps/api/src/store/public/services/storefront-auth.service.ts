import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomerAuthResponse, CustomerJwtPayload } from '@vyntra/types';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorefrontRegisterDto, StorefrontLoginDto } from '../dto';

@Injectable()
export class StorefrontAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Registers a new shopper, or — if a passwordless StoreCustomer already
   * exists for this org+email (e.g. from a prior guest checkout, or an
   * admin-created CRM record) — attaches the password to that existing
   * record instead of creating a duplicate, so their order history carries
   * over. No email verification step: EmailService doesn't actually send
   * mail yet in this app, so gating on verification would silently break
   * signup entirely.
   */
  async register(orgId: string, dto: StorefrontRegisterDto): Promise<CustomerAuthResponse> {
    const existing = await this.prisma.storeCustomer.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });

    if (existing?.passwordHash) {
      throw new BadRequestException('An account with this email already exists');
    }

    const passwordHash = await this.hash(dto.password);

    const customer = existing
      ? await this.prisma.storeCustomer.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: dto.name,
            phone: dto.phone ?? existing.phone,
            lastLoginAt: new Date(),
          },
        })
      : await this.prisma.storeCustomer.create({
          data: {
            organizationId: orgId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            lastLoginAt: new Date(),
          },
        });

    return this.buildAuthResponse(customer);
  }

  async login(orgId: string, dto: StorefrontLoginDto): Promise<CustomerAuthResponse> {
    const customer = await this.prisma.storeCustomer.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });

    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.storeCustomer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(customer);
  }

  async refresh(refreshToken: string): Promise<CustomerAuthResponse> {
    let decoded: CustomerJwtPayload;
    try {
      decoded = await this.jwt.verifyAsync<CustomerJwtPayload>(refreshToken, {
        secret: this.config.get<string>('STOREFRONT_JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (decoded.typ !== 'storefront_customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const customer = await this.prisma.storeCustomer.findUnique({
      where: { id: decoded.sub },
    });
    if (!customer || customer.organizationId !== decoded.organizationId) {
      throw new UnauthorizedException('Customer not found');
    }

    return this.buildAuthResponse(customer);
  }

  /** Issues a session for a guest StoreCustomer immediately after checkout, so the confirmation page can show a real /account/orders/:id view. */
  async issueGuestSession(customer: { id: string; organizationId: string; email: string; name: string; phone: string | null }): Promise<CustomerAuthResponse> {
    return this.buildAuthResponse(customer as any);
  }

  private async hash(password: string): Promise<string> {
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
    return bcrypt.hash(password, rounds);
  }

  private async buildAuthResponse(customer: {
    id: string;
    organizationId: string;
    name: string;
    email: string;
    phone: string | null;
  }): Promise<CustomerAuthResponse> {
    const payload: CustomerJwtPayload = {
      sub: customer.id,
      organizationId: customer.organizationId,
      email: customer.email,
      typ: 'storefront_customer',
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('STOREFRONT_JWT_SECRET'),
      expiresIn: this.config.get<string>('STOREFRONT_JWT_EXPIRATION') ?? '2h',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('STOREFRONT_JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('STOREFRONT_JWT_REFRESH_EXPIRATION') ?? '30d',
    });

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      accessToken,
      refreshToken,
    };
  }
}
