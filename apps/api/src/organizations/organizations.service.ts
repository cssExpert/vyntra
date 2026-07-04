import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrganizationDto,
  OrganizationSettingsDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  findAll() {
    return this.prisma.organization.findMany({
      include: {
        subscription: { include: { package: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMembers(organizationId: string | null) {
    if (!organizationId) return [];
    const users = await this.prisma.user.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { select: { role: true }, take: 1 },
      },
      orderBy: { name: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name || u.email,
      email: u.email,
      role: u.roles[0]?.role ?? 'MEMBER',
    }));
  }

  /**
   * Full company detail for the super-admin "View Company" page:
   * profile, members (with roles), subscription + package, and the package's
   * granted modules (for the Modules & Permissions tab).
   */
  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            package: { include: { modules: { include: { module: true } } } },
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            superAdmin: true,
            lastLogin: true,
            createdAt: true,
            roles: { select: { role: true, organizationId: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { users: true } },
      },
    });
    if (!org) throw new NotFoundException('Company not found');

    // Flatten the package's granted modules into a simple, UI-friendly list.
    const grantedModules =
      org.subscription?.package.modules
        .map((pm) => ({
          key: pm.module.key,
          name: pm.module.name,
          description: pm.module.description,
          isActive: pm.module.isActive,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [];

    // Surface all platform modules too, marking which are enabled for this company.
    const allModules = await this.prisma.module.findMany({
      orderBy: { name: 'asc' },
    });
    const grantedKeys = new Set(grantedModules.map((m) => m.key));
    const modules = allModules.map((m) => ({
      key: m.key,
      name: m.name,
      description: m.description,
      enabled: grantedKeys.has(m.key) && m.isActive,
    }));

    return { ...org, grantedModules, modules };
  }

  /**
   * Provision a new company together with its first administrator, all in a
   * single transaction — if the user creation fails (e.g. duplicate email) the
   * company and subscription are rolled back too.
   */
  async create(dto: CreateOrganizationDto) {
    const pkg = await this.requirePackage(dto.packageSlug);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });
    if (existingUser) {
      throw new ConflictException('Admin email is already registered');
    }

    const slug = await this.uniqueSlug(dto.name);
    const passwordHash = await this.hash(dto.adminPassword);
    const adminName = [dto.adminFirstName, dto.adminLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          legalName: dto.legalName,
          industry: dto.industry,
          address: dto.address,
          slug,
          email: dto.email,
          phone: dto.phone,
          website: dto.website,
          logoUrl: dto.logoUrl,
          maxUsers: pkg.maxUsers,
          subscription: {
            create: { packageId: pkg.id, billingEmail: dto.email },
          },
        },
        include: {
          subscription: { include: { package: true } },
          _count: { select: { users: true } },
        },
      });

      await tx.user.create({
        data: {
          email: dto.adminEmail,
          name: adminName || null,
          password: passwordHash,
          organizationId: org.id,
          roles: {
            create: { role: Role.ORG_ADMIN, organizationId: org.id },
          },
        },
      });

      return org;
    });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    const { packageSlug, ...profile } = dto;

    // Resolve a package change up-front so a bad slug fails before any write.
    const pkg = packageSlug ? await this.requirePackage(packageSlug) : null;

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id },
        data: profile,
        include: {
          subscription: { include: { package: true } },
          _count: { select: { users: true } },
        },
      });

      if (pkg) {
        await tx.subscription.upsert({
          where: { organizationId: id },
          create: { organizationId: id, packageId: pkg.id },
          update: { packageId: pkg.id, status: 'ACTIVE' },
        });
      }

      return org;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.organization.delete({ where: { id } });
    return { success: true };
  }

  /** Super admin: change which package an organization is subscribed to. */
  async assignPackage(id: string, packageSlug: string) {
    await this.findOne(id);
    const pkg = await this.requirePackage(packageSlug);
    return this.prisma.subscription.upsert({
      where: { organizationId: id },
      create: { organizationId: id, packageId: pkg.id },
      update: { packageId: pkg.id, status: 'ACTIVE' },
      include: { package: true },
    });
  }

  /** Get organization settings (branding, notifications, etc). */
  async getSettings(organizationId: string | null) {
    if (!organizationId) {
      throw new BadRequestException('No organization context');
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        email: true,
        slug: true,
        logoUrl: true,
        darkLogoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        emailNotifications: true,
        slackNotifications: true,
        themeSwitcherEnabled: true,
        blogCommentsEnabled: true,
        blogFeaturedEnabled: true,
        blogPinToTopEnabled: true,
        siteLanguages: true,
        defaultSiteLanguage: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  /** Update organization settings. */
  async updateSettings(
    organizationId: string | null,
    dto: OrganizationSettingsDto,
  ) {
    if (!organizationId) {
      throw new BadRequestException('No organization context');
    }
    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.darkLogoUrl !== undefined) data.darkLogoUrl = dto.darkLogoUrl;
    if (dto.faviconUrl !== undefined) data.faviconUrl = dto.faviconUrl;
    if (dto.themeSwitcherEnabled !== undefined) data.themeSwitcherEnabled = dto.themeSwitcherEnabled;
    if (dto.blogCommentsEnabled !== undefined) data.blogCommentsEnabled = dto.blogCommentsEnabled;
    if (dto.blogFeaturedEnabled !== undefined) data.blogFeaturedEnabled = dto.blogFeaturedEnabled;
    if (dto.blogPinToTopEnabled !== undefined) data.blogPinToTopEnabled = dto.blogPinToTopEnabled;
    if (dto.siteLanguages !== undefined) data.siteLanguages = dto.siteLanguages;
    if (dto.defaultSiteLanguage) data.defaultSiteLanguage = dto.defaultSiteLanguage;
    if (dto.primaryColor) data.primaryColor = dto.primaryColor;
    if (dto.secondaryColor) data.secondaryColor = dto.secondaryColor;
    if (dto.accentColor) data.accentColor = dto.accentColor;
    if (dto.emailNotifications !== undefined) data.emailNotifications = dto.emailNotifications;
    if (dto.slackNotifications !== undefined) data.slackNotifications = dto.slackNotifications;

    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
      select: {
        name: true,
        email: true,
        slug: true,
        logoUrl: true,
        darkLogoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        emailNotifications: true,
        slackNotifications: true,
        themeSwitcherEnabled: true,
        blogCommentsEnabled: true,
        blogFeaturedEnabled: true,
        blogPinToTopEnabled: true,
        siteLanguages: true,
        defaultSiteLanguage: true,
      },
    });
  }

  /** What an org member sees about their own org, incl. entitled module keys. */
  async getCurrentOrg(organizationId: string | null) {
    if (!organizationId) {
      throw new BadRequestException('No organization context');
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: {
          include: {
            package: { include: { modules: { include: { module: true } } } },
          },
        },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const sub = org.subscription;
    const entitledModules =
      sub && ['ACTIVE', 'TRIALING'].includes(sub.status) && sub.package.isActive
        ? sub.package.modules
            .filter((pm) => pm.module.isActive)
            .map((pm) => pm.module)
        : [];
    const modules = entitledModules.map((m) => m.key);
    // Key → display name, so the UI can label nav items dynamically.
    const moduleNames = Object.fromEntries(
      entitledModules.map((m) => [m.key, m.name]),
    );

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      email: org.email,
      phone: org.phone,
      website: org.website,
      isActive: org.isActive,
      maxUsers: org.maxUsers,
      createdAt: org.createdAt,
      subscription: sub
        ? {
            status: sub.status,
            packageName: sub.package.name,
            billingCycle: sub.package.billingCycle,
          }
        : null,
      modules,
      moduleNames,
    };
  }

  /** Recent audit-log activity for the current organization. */
  async getActivity(organizationId: string | null, limit = 50) {
    if (!organizationId) {
      throw new BadRequestException('No organization context');
    }
    const logs = await this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      include: { user: { select: { name: true, email: true } } },
    });
    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      statusCode: log.statusCode,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
      user: log.user
        ? { name: log.user.name, email: log.user.email }
        : null,
    }));
  }

  // ── helpers ──────────────────────────────────────────────

  private async requirePackage(slug: string) {
    const pkg = await this.prisma.package.findFirst({
      where: { slug, isActive: true },
    });
    if (!pkg) throw new BadRequestException(`Unknown or inactive package: ${slug}`);
    return pkg;
  }

  private async uniqueSlug(name: string): Promise<string> {
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

  private hash(password: string) {
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
    return bcrypt.hash(password, rounds);
  }
}
