import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({
      include: {
        subscription: { include: { package: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: { include: { package: true } },
        _count: { select: { users: true } },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async create(dto: CreateOrganizationDto) {
    const pkg = await this.requirePackage(dto.packageSlug);
    const slug = await this.uniqueSlug(dto.name);
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        maxUsers: pkg.maxUsers,
        subscription: {
          create: { packageId: pkg.id, billingEmail: dto.email },
        },
      },
      include: { subscription: { include: { package: true } } },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
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
    const modules =
      sub && ['ACTIVE', 'TRIALING'].includes(sub.status) && sub.package.isActive
        ? sub.package.modules
            .filter((pm) => pm.module.isActive)
            .map((pm) => pm.module.key)
        : [];

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
    };
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
}
