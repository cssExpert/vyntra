import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as dns from 'dns';
import { PrismaService } from '../prisma/prisma.service';
import { SetCustomDomainDto, SetSubdomainDto } from './dto/domain.dto';

const DOMAIN_SELECT = {
  id: true,
  name: true,
  slug: true,
  subdomain: true,
  customDomain: true,
  customDomainVerified: true,
  domainVerificationToken: true,
  isActive: true,
} as const;

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getOrgDomain(orgId: string) {
    const org = await this.requireOrg(orgId);
    return this.toResponse(org);
  }

  async setSubdomain(orgId: string, dto: SetSubdomainDto) {
    await this.requireOrg(orgId);
    const conflict = await this.prisma.organization.findFirst({
      where: { subdomain: dto.subdomain, id: { not: orgId } },
      select: { id: true },
    });
    if (conflict) throw new ConflictException('Subdomain is already taken');
    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: { subdomain: dto.subdomain },
      select: DOMAIN_SELECT,
    });
    return this.toResponse(updated);
  }

  async clearSubdomain(orgId: string) {
    await this.requireOrg(orgId);
    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: { subdomain: null },
      select: DOMAIN_SELECT,
    });
    return this.toResponse(updated);
  }

  async setCustomDomain(orgId: string, dto: SetCustomDomainDto) {
    await this.requireOrg(orgId);
    const domain = dto.customDomain.toLowerCase().trim();
    const conflict = await this.prisma.organization.findFirst({
      where: { customDomain: domain, id: { not: orgId } },
      select: { id: true },
    });
    if (conflict) throw new ConflictException('Domain is already in use');
    const token = `vyntra-verify-${randomBytes(16).toString('hex')}`;
    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        customDomain: domain,
        customDomainVerified: false,
        domainVerificationToken: token,
      },
      select: DOMAIN_SELECT,
    });
    return this.toResponse(updated);
  }

  async clearCustomDomain(orgId: string) {
    await this.requireOrg(orgId);
    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        customDomain: null,
        customDomainVerified: false,
        domainVerificationToken: null,
      },
      select: DOMAIN_SELECT,
    });
    return this.toResponse(updated);
  }

  async verifyCustomDomain(orgId: string) {
    const org = await this.requireOrg(orgId);
    if (!org.customDomain)
      throw new BadRequestException('No custom domain configured');
    if (org.customDomainVerified)
      return { verified: true, message: 'Domain is already verified' };
    if (!org.domainVerificationToken)
      throw new BadRequestException(
        'No verification token — re-save the custom domain to regenerate',
      );

    const txtHost = `_vyntra-verify.${org.customDomain}`;
    try {
      const records = await dns.promises.resolveTxt(txtHost);
      const matched = records
        .flat()
        .some((r) => r === org.domainVerificationToken);
      if (matched) {
        await this.prisma.organization.update({
          where: { id: orgId },
          data: { customDomainVerified: true },
        });
        return { verified: true, message: 'Domain verified successfully!' };
      }
      return {
        verified: false,
        message:
          'TXT record not found yet. DNS changes can take up to 48 hours to propagate.',
      };
    } catch {
      return {
        verified: false,
        message:
          'Could not look up DNS records. Ensure the TXT record is added and try again.',
      };
    }
  }

  async getDnsInfo(orgId: string) {
    const org = await this.requireOrg(orgId);
    const platformDomain =
      this.config.get<string>('PLATFORM_DOMAIN') || 'vyntra.com';
    const platformIp =
      this.config.get<string>('PLATFORM_IP') || '0.0.0.0';

    const subdomainUrl = org.subdomain
      ? `https://${org.subdomain}.${platformDomain}`
      : null;

    const dnsRecords = org.customDomain
      ? [
          {
            type: 'A',
            name: '@',
            value: platformIp,
            ttl: 3600,
            note: 'Points your root domain to the Vyntra platform IP.',
          },
          {
            type: 'CNAME',
            name: 'www',
            value: `${platformDomain}.`,
            ttl: 3600,
            note: 'Optional — redirects www traffic to the platform.',
          },
          {
            type: 'TXT',
            name: `_vyntra-verify.${org.customDomain}`,
            value: org.domainVerificationToken ?? '(set a custom domain first)',
            ttl: 300,
            note: 'Required to verify domain ownership.',
          },
        ]
      : [];

    return {
      subdomain: org.subdomain,
      subdomainUrl,
      platformDomain,
      platformIp,
      customDomain: org.customDomain,
      customDomainVerified: org.customDomainVerified,
      dnsRecords,
    };
  }

  // ── Public site resolution (used by Next.js public pages) ─────────────────

  async resolveBySubdomain(subdomain: string) {
    // Try by subdomain first, then fall back to org slug (used for internal preview)
    const org =
      (await this.prisma.organization.findFirst({
        where: { subdomain, isActive: true },
        select: this.publicSelect(),
      })) ??
      (await this.prisma.organization.findFirst({
        where: { slug: subdomain, isActive: true },
        select: this.publicSelect(),
      }));
    if (!org) throw new NotFoundException('No site found for this subdomain');
    return this.assertCmsEnabled(org);
  }

  async resolveByCustomDomain(domain: string) {
    const org = await this.prisma.organization.findFirst({
      where: {
        customDomain: domain.toLowerCase(),
        customDomainVerified: true,
        isActive: true,
      },
      select: this.publicSelect(),
    });
    if (!org)
      throw new NotFoundException('No verified site found for this domain');
    return this.assertCmsEnabled(org);
  }

  async getLandingPage(orgId: string) {
    const page = await this.prisma.page.findFirst({
      where: { organizationId: orgId, isLandingPage: true, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        metaDesc: true,
        metaKeywords: true,
        publishedAt: true,
        updatedAt: true,
        layoutId: true,
      },
    });
    if (!page) throw new NotFoundException('No landing page configured');
    return page;
  }

  async getPublishedPages(orgId: string) {
    return this.prisma.page.findMany({
      where: { organizationId: orgId, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        metaDesc: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getPublishedPage(orgId: string, slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { organizationId: orgId, slug, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        metaDesc: true,
        metaKeywords: true,
        publishedAt: true,
        updatedAt: true,
        layoutId: true,
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async getPublicLayout(orgId: string, layoutId?: string) {
    const layout = layoutId
      ? await this.prisma.layout.findFirst({
          where: { id: layoutId, organizationId: orgId },
        })
      : await this.prisma.layout.findFirst({
          where: { organizationId: orgId, isDefault: true },
          orderBy: { createdAt: 'asc' },
        });

    return {
      id: layout?.id ?? null,
      navMenuId: layout?.navMenuId ?? null,
      footerColumns: (layout?.footerColumns ?? []) as { title: string; menuId: string }[],
    };
  }

  async getPublicMenu(orgId: string, menuId: string) {
    const menu = await this.prisma.menu.findFirst({
      where: { id: menuId, organizationId: orgId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!menu) throw new NotFoundException('Menu not found');

    // Resolve page:// and blog:// protocol references to live slugs
    const resolvedItems = await Promise.all(
      menu.items.map(async (item) => {
        if (item.url.startsWith('page://')) {
          const pageId = item.url.slice(7);
          const page = await this.prisma.page.findFirst({
            where: { id: pageId, organizationId: orgId, published: true },
            select: { slug: true },
          });
          return { ...item, url: page ? `/${page.slug}` : '#' };
        }
        if (item.url.startsWith('blog://')) {
          const blogId = item.url.slice(7);
          const blog = await this.prisma.blog.findFirst({
            where: { id: blogId, organizationId: orgId, published: true },
            select: { slug: true },
          });
          return { ...item, url: blog ? `/blog/${blog.slug}` : '#' };
        }
        return item;
      }),
    );

    return { ...menu, items: resolvedItems };
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  private async requireOrg(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      select: DOMAIN_SELECT,
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  private toResponse(org: {
    id: string;
    subdomain: string | null;
    customDomain: string | null;
    customDomainVerified: boolean;
    domainVerificationToken: string | null;
  }) {
    return {
      id: org.id,
      subdomain: org.subdomain,
      customDomain: org.customDomain,
      customDomainVerified: org.customDomainVerified,
      domainVerificationToken: org.domainVerificationToken,
    };
  }

  private publicSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      subdomain: true,
      subscription: {
        include: {
          package: {
            include: { modules: { include: { module: true } } },
          },
        },
      },
    } as const;
  }

  private assertCmsEnabled(org: {
    id: string;
    name: string;
    slug: string;
    subdomain: string | null;
    subscription: {
      status: string;
      package: {
        isActive: boolean;
        modules: { module: { key: string; isActive: boolean } }[];
      };
    } | null;
  }) {
    const sub = org.subscription;
    const hasCms =
      sub != null &&
      ['ACTIVE', 'TRIALING'].includes(sub.status) &&
      sub.package.isActive &&
      sub.package.modules.some(
        (pm) => pm.module.key === 'CMS' && pm.module.isActive,
      );
    if (!hasCms)
      throw new NotFoundException('CMS module is not enabled for this site');
    return { id: org.id, name: org.name, slug: org.slug, subdomain: org.subdomain };
  }
}
