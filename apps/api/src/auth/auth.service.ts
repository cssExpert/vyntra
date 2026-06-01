import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AuthResponse, JwtPayload } from '@vyntra/types';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /** Self-signup: new org + ORG_ADMIN user + package subscription. */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    // Resolve the requested package, or fall back to the cheapest public one.
    const pkg = dto.packageSlug
      ? await this.prisma.package.findFirst({
          where: { slug: dto.packageSlug, isActive: true, isPublic: true },
        })
      : await this.prisma.package.findFirst({
          where: { isActive: true, isPublic: true },
          orderBy: { priceCents: 'asc' },
        });
    if (!pkg) {
      throw new BadRequestException('No valid package available to subscribe to');
    }

    const passwordHash = await this.hash(dto.password);
    const slug = await this.uniqueOrgSlug(dto.organizationName);

    const user = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug,
          email: dto.email,
          maxUsers: pkg.maxUsers,
          subscription: {
            create: { packageId: pkg.id, billingEmail: dto.email },
          },
        },
      });

      return tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: passwordHash,
          organizationId: org.id,
          roles: { create: { role: Role.ORG_ADMIN, organizationId: org.id } },
        },
        include: { roles: true },
      });
    });

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      superAdmin: user.superAdmin,
      organizationId: user.organizationId,
      roles: user.roles.map((r) => r.role),
    });
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      superAdmin: user.superAdmin,
      organizationId: user.organizationId,
      roles: user.roles.map((r) => r.role),
    });
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let decoded: { sub: string };
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { roles: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      superAdmin: user.superAdmin,
      organizationId: user.organizationId,
      roles: user.roles.map((r) => r.role),
    });
  }

  // ── helpers ─────────────────────────────────────────────

  private async hash(password: string): Promise<string> {
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
    return bcrypt.hash(password, rounds);
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    superAdmin: boolean;
    organizationId: string | null;
    roles: Role[];
  }): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      superAdmin: user.superAdmin,
      roles: user.roles as JwtPayload['roles'],
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRATION') ?? '24h',
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d',
      },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        superAdmin: user.superAdmin,
        organizationId: user.organizationId,
        roles: user.roles as JwtPayload['roles'],
      },
      accessToken,
      refreshToken,
    };
  }

  /** Build a unique, URL-safe org slug from the org name. */
  private async uniqueOrgSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'org';

    let slug = base;
    let n = 1;
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }
}
