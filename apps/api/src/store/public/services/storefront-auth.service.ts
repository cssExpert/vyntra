import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomerAuthResponse, CustomerJwtPayload, CustomerRegisterResult } from '@vyntra/types';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailService } from '../../services/email.service';
import { StorefrontRegisterDto, StorefrontLoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class StorefrontAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
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
  async register(orgId: string, dto: StorefrontRegisterDto): Promise<CustomerRegisterResult> {
    const existing = await this.prisma.storeCustomer.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });

    if (existing?.passwordHash) {
      throw new BadRequestException('An account with this email already exists');
    }

    let group: { id: string; requiresApproval: boolean } | null = null;
    if (dto.customerGroupId) {
      group = await this.prisma.customerGroup.findFirst({
        where: { id: dto.customerGroupId, organizationId: orgId },
        select: { id: true, requiresApproval: true },
      });
      if (!group) throw new NotFoundException('Selected account type not found');
    }

    const passwordHash = await this.hash(dto.password);
    // A group that requiresApproval keeps the new account "unverified" (the
    // same status the admin Customers screen already uses/edits) until
    // staff manually flip it to "active" — there's no separate approval
    // queue/endpoint, this reuses the existing customer status field and
    // admin edit UI rather than inventing a new mechanism.
    const status = group?.requiresApproval ? 'unverified' : 'active';

    const customer = existing
      ? await this.prisma.storeCustomer.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: dto.name,
            phone: dto.phone ?? existing.phone,
            customerGroupId: group?.id,
            status,
            lastLoginAt: status === 'active' ? new Date() : undefined,
          },
        })
      : await this.prisma.storeCustomer.create({
          data: {
            organizationId: orgId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            customerGroupId: group?.id,
            status,
            lastLoginAt: status === 'active' ? new Date() : undefined,
          },
        });

    // Address collected on the full signup page becomes this customer's
    // default shipping + billing address — mirrors the same
    // clear-existing-defaults-then-create pattern StorefrontAccountService
    // uses for the /account/addresses "add address" flow.
    if (dto.address?.line1) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefaultShipping: false, isDefaultBilling: false },
      });
      await this.prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          name: dto.name,
          line1: dto.address.line1,
          line2: dto.address.line2,
          city: dto.address.city ?? '',
          state: dto.address.state ?? '',
          country: dto.address.country ?? '',
          zip: dto.address.zip ?? '',
          phone: dto.phone,
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      });
    }

    if (status === 'unverified') {
      return {
        pending: true,
        message: 'Your account has been created and is awaiting approval. We\'ll email you once it\'s active.',
      };
    }

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

    if (customer.status === 'unverified') {
      throw new UnauthorizedException('Your account is still awaiting approval');
    }
    if (customer.status === 'blocked') {
      throw new UnauthorizedException('Your account has been blocked. Please contact support.');
    }

    await this.prisma.storeCustomer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(customer);
  }

  /**
   * Always returns the same generic response whether or not the email
   * exists/has a password — never confirm which emails are registered.
   * Email delivery itself is stubbed app-wide (EmailService.sendViaSMTP is
   * a TODO no-op), so this only actually works end-to-end today because
   * sendPasswordReset explicitly logs the reset URL regardless of
   * environment — real delivery needs the same SMTP wiring as everything
   * else that "sends" email in this app.
   */
  async forgotPassword(orgId: string, dto: ForgotPasswordDto): Promise<{ success: true; message: string }> {
    const customer = await this.prisma.storeCustomer.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });

    if (customer?.passwordHash) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.storeCustomer.update({
        where: { id: customer.id },
        data: { passwordResetToken: token, passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
      });

      const resetUrl = dto.resetUrlBase ? `${dto.resetUrlBase}?token=${token}` : `(no reset URL base provided) token=${token}`;
      this.emailService.sendPasswordReset(customer.email, customer.name, resetUrl).catch(() => {
        // Best-effort — never let a stubbed/failed "send" surface as a request failure.
      });
    }

    return { success: true, message: "If that email has an account, we've sent password reset instructions." };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: true }> {
    const customer = await this.prisma.storeCustomer.findFirst({
      where: { passwordResetToken: dto.token, passwordResetExpiresAt: { gt: new Date() } },
    });
    if (!customer) {
      throw new BadRequestException('This reset link is invalid or has expired');
    }

    await this.prisma.storeCustomer.update({
      where: { id: customer.id },
      data: {
        passwordHash: await this.hash(dto.newPassword),
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    return { success: true };
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
