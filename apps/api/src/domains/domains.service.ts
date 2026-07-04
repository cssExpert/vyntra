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

  async getLandingPage(orgId: string, lang?: string) {
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
        themeId: true,
        theme: { select: { identifier: true } },
      },
    });
    if (!page) throw new NotFoundException('No landing page configured');
    const translated = await this.applyTranslation(page, lang);
    return { ...translated, themeIdentifier: page.theme?.identifier ?? null };
  }

  async getPublishedPages(orgId: string, lang?: string) {
    const pages = await this.prisma.page.findMany({
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
    if (!lang || lang === 'en') return pages;
    const translations = await this.prisma.pageTranslation.findMany({
      where: { pageId: { in: pages.map((p) => p.id) }, lang },
    });
    const tMap = new Map(translations.map((t) => [t.pageId, t]));
    return pages.map((p) => {
      const t = tMap.get(p.id);
      return t ? { ...p, title: t.title, metaDesc: t.metaDesc ?? p.metaDesc } : p;
    });
  }

  async getPublishedPage(orgId: string, slug: string, lang?: string) {
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
        themeId: true,
        theme: { select: { identifier: true } },
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    const translated = await this.applyTranslation(page, lang);
    return { ...translated, themeIdentifier: page.theme?.identifier ?? null };
  }

  private async applyTranslation<T extends { id: string; title: string; content?: string | null; metaDesc?: string | null; metaKeywords?: string | null }>(
    page: T,
    lang?: string,
  ): Promise<T> {
    if (!lang || lang === 'en') return page;
    const t = await this.prisma.pageTranslation.findUnique({ where: { pageId_lang: { pageId: page.id, lang } } });
    if (!t) return page;
    return {
      ...page,
      title: t.title,
      content: t.content ?? page.content,
      metaDesc: t.metaDesc ?? page.metaDesc,
      metaKeywords: t.metaKeywords ?? page.metaKeywords,
    };
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

  async getPublicTheme(orgId: string, previewId?: string) {
    // Preview mode: return a specific theme regardless of active setting
    if (previewId) {
      const preview = await this.prisma.theme.findFirst({
        where: { id: previewId, isGlobal: true },
        select: { id: true, name: true, identifier: true },
      });
      if (preview) return preview;
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        activeTheme: {
          select: { id: true, name: true, identifier: true },
        },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');

    if (org.activeTheme) return org.activeTheme;

    // Fall back to the first global theme if no active theme set
    const fallback = await this.prisma.theme.findFirst({
      where: { isGlobal: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, identifier: true },
    });

    return fallback ?? { id: null, name: 'Default', identifier: 'shopingo' };
  }

  private static readonly PUBLIC_PRODUCT_SELECT = {
    id: true,
    name: true,
    slug: true,
    price: true,
    compareAtPrice: true,
    featuredImage: true,
    brand: true,
    stockStatus: true,
  } as const;

  private static readonly PUBLIC_PRODUCT_SORTS = {
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
  } as const;

  /**
   * Public product listing for storefront pages/blocks (shop grid, product-grid,
   * product-tabs). Only ever returns `active` products, and only fields safe to
   * expose to an anonymous visitor — no cost price, stock counts, order/review
   * counts, etc.
   */
  async getPublicProducts(
    orgId: string,
    {
      categoryId,
      type,
      brand,
      minPrice,
      maxPrice,
      skip = 0,
      take = 8,
      sort = 'newest',
    }: {
      categoryId?: string;
      type?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      skip?: number;
      take?: number;
      sort?: keyof typeof DomainsService.PUBLIC_PRODUCT_SORTS;
    } = {},
  ) {
    const limit = Math.min(Math.max(take, 1), 48);
    const priceFilter =
      minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {};
    const where = {
      organizationId: orgId,
      status: 'active',
      ...(categoryId && { categoryIds: { has: categoryId } }),
      ...(type && { type }),
      ...(brand && { brand }),
      ...priceFilter,
    };
    const orderBy =
      DomainsService.PUBLIC_PRODUCT_SORTS[sort] ??
      DomainsService.PUBLIC_PRODUCT_SORTS.newest;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: DomainsService.PUBLIC_PRODUCT_SELECT,
        orderBy,
        skip: Math.max(skip, 0),
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, skip, take: limit, hasMore: skip + data.length < total };
  }

  /** Distinct brands + price range across an org's active products, for shop-page filter sidebars. */
  async getPublicProductFacets(orgId: string) {
    const where = { organizationId: orgId, status: 'active' };
    const [brandRows, priceAgg] = await Promise.all([
      this.prisma.product.findMany({
        where: { ...where, brand: { not: null } },
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),
      this.prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);
    return {
      brands: brandRows.map((r) => r.brand).filter((b): b is string => !!b),
      priceRange: { min: priceAgg._min.price ?? 0, max: priceAgg._max.price ?? 0 },
    };
  }

  /** Public category list for shop-page filter sidebars / category navigation. */
  async getPublicCategories(orgId: string) {
    const categories = await this.prisma.productCategory.findMany({
      where: { organizationId: orgId, status: 'active' },
      select: { id: true, name: true, slug: true, parentId: true, imageUrl: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { data: categories };
  }

  /**
   * Everything the storefront /products page needs from CMS → Page Settings:
   * SEO meta, Open Graph, favicon, injected scripts/CSS, and the configured
   * page size. One read, one row — mirrors SystemPageSettingsService's own
   * `toDto`, but only the fields safe to hand to an anonymous visitor.
   */
  async getPublicProductListingSettings(orgId: string) {
    const settings = await this.prisma.systemPageSettings.findUnique({
      where: { organizationId_pageType: { organizationId: orgId, pageType: 'product-listing' } },
    });
    const custom = (settings?.customSettings as Record<string, unknown> | null) ?? {};
    const productsPerPage = Number(custom.productsPerPage);
    return {
      metaTitle: settings?.metaTitle ?? null,
      metaDesc: settings?.metaDesc ?? null,
      metaKeywords: settings?.metaKeywords ?? null,
      noIndex: settings?.noIndex ?? false,
      ogTitle: settings?.ogTitle ?? null,
      ogDescription: settings?.ogDescription ?? null,
      ogType: settings?.ogType ?? 'website',
      ogUrl: settings?.ogUrl ?? null,
      ogImage: settings?.ogImage ?? null,
      faviconUrl: settings?.faviconUrl ?? null,
      headScript: settings?.headScript ?? null,
      bodyScript: settings?.bodyScript ?? null,
      customCss: settings?.customCss ?? null,
      productsPerPage: Number.isFinite(productsPerPage) && productsPerPage > 0 ? productsPerPage : 12,
    };
  }

  async getPublicForm(orgId: string, slug: string) {
    const form = await this.prisma.cmsForm.findFirst({
      where: { organizationId: orgId, slug, status: 'Published' },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        fields: true,
        captchaEnabled: true,
      },
    });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async submitPublicForm(orgId: string, slug: string, data: Record<string, unknown>) {
    const form = await this.prisma.cmsForm.findFirst({
      where: { organizationId: orgId, slug, status: 'Published' },
      select: { id: true },
    });
    if (!form) throw new NotFoundException('Form not found');
    await this.prisma.cmsFormSubmission.create({
      data: { formId: form.id, data: data as object },
    });
    return { ok: true };
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
      logoUrl: true,
      darkLogoUrl: true,
      themeSwitcherEnabled: true,
      siteLanguages: true,
      defaultSiteLanguage: true,
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
    logoUrl?: string | null;
    darkLogoUrl?: string | null;
    themeSwitcherEnabled?: boolean;
    siteLanguages?: string[];
    defaultSiteLanguage?: string;
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
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      subdomain: org.subdomain,
      logoUrl: org.logoUrl ?? null,
      darkLogoUrl: org.darkLogoUrl ?? null,
      themeSwitcherEnabled: org.themeSwitcherEnabled ?? false,
      siteLanguages: org.siteLanguages ?? ["en"],
      defaultSiteLanguage: org.defaultSiteLanguage ?? "en",
    };
  }
}
