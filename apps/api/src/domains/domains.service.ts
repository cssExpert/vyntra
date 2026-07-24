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
import { TagsService } from '../tags/tags.service';
import { SetCustomDomainDto, SetSubdomainDto } from './dto/domain.dto';
import { SubmitContactFormDto } from './dto/contact-submission.dto';
import { SubscribeNewsletterDto } from './dto/newsletter-subscription.dto';
import { COMMENT_RESOURCE_TYPES, SubmitCommentDto } from './dto/comment-submission.dto';
import { verifyRecaptcha } from '../common/recaptcha';

// Newsletter signup currently only collects an email address — until a real
// name field is added to that form, derive a display name from the local
// part so the column is already populated (e.g. "jane.doe" -> "Jane Doe").
function deriveNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local
    .split(/[.\-_+]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || local;
}

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
    private readonly tagsService: TagsService,
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
        noIndex: true,
        publishedAt: true,
        updatedAt: true,
        layoutId: true,
        themeId: true,
        theme: { select: { identifier: true } },
        ogTitle: true,
        ogDescription: true,
        ogType: true,
        ogUrl: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        twitterCardSize: true,
        faviconUrl: true,
        headScript: true,
        bodyScript: true,
        customCss: true,
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
        noIndex: true,
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
        noIndex: true,
        publishedAt: true,
        updatedAt: true,
        layoutId: true,
        themeId: true,
        theme: { select: { identifier: true } },
        ogTitle: true,
        ogDescription: true,
        ogType: true,
        ogUrl: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        twitterCardSize: true,
        faviconUrl: true,
        headScript: true,
        bodyScript: true,
        customCss: true,
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
   * Everything the storefront /shop page needs from CMS → Page Settings:
   * SEO meta, Open Graph, favicon, injected scripts/CSS, the configured
   * page size, and the top-of-page banner. One read, one row — mirrors
   * SystemPageSettingsService's own `toDto`, but only the fields safe to
   * hand to an anonymous visitor.
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
      bannerEnabled: custom.bannerEnabled === true,
      bannerImage: typeof custom.bannerImage === 'string' ? custom.bannerImage : null,
      bannerTitle: typeof custom.bannerTitle === 'string' ? custom.bannerTitle : '',
      bannerSubtitle: typeof custom.bannerSubtitle === 'string' ? custom.bannerSubtitle : '',
    };
  }

  private static readonly PUBLIC_PRODUCT_DETAIL_SELECT = {
    id: true,
    name: true,
    slug: true,
    shortDescription: true,
    description: true,
    specification: true,
    price: true,
    compareAtPrice: true,
    featuredImage: true,
    brand: true,
    sku: true,
    stock: true,
    stockStatus: true,
    type: true,
    weight: true,
    categoryIds: true,
    seoTitle: true,
    seoDescription: true,
    seoKeywords: true,
    publishedAt: true,
    media: {
      select: { id: true, url: true, alt: true, isPrimary: true, sortOrder: true },
      orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
    },
    variants: {
      select: {
        id: true,
        sku: true,
        attributes: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        imageUrl: true,
      },
      orderBy: { createdAt: 'asc' as const },
    },
  };

  /** Full product detail for storefront /shop/:slug — only active products. */
  async getPublicProductDetail(orgId: string, slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { organizationId: orgId, slug, status: 'active' },
      select: DomainsService.PUBLIC_PRODUCT_DETAIL_SELECT,
    });
    // Product has no `tags` field yet — keep the shape the storefront expects.
    return product ? { ...product, tags: [] as string[] } : null;
  }

  /** SKU → product lookup for the storefront Quick Order feature. Returns null (not 404) so the UI can show a per-row "not found" without a try/catch per lookup. */
  async getPublicProductBySku(orgId: string, sku: string) {
    if (!sku?.trim()) return null;
    const product = await this.prisma.product.findFirst({
      where: { organizationId: orgId, sku: sku.trim(), status: 'active' },
      select: { id: true, name: true, slug: true, sku: true, price: true, stock: true, stockStatus: true, featuredImage: true },
    });
    return product ?? null;
  }

  private static readonly PUBLIC_BLOG_SELECT = {
    id: true,
    title: true,
    subtitle: true,
    slug: true,
    excerpt: true,
    coverImage: true,
    author: true,
    category: true,
    publishedAt: true,
    isFeatured: true,
    pinToTop: true,
  } as const;

  /**
   * Public blog listing for the storefront /blog page. Only published,
   * publicly-visible posts, and only fields safe to expose to an anonymous
   * visitor. isFeatured/pinToTop are clamped to the org's blog feature
   * switches (CMS Settings → Blog), same as the admin-facing getBlog does.
   */
  async getPublicBlogs(
    orgId: string,
    {
      category,
      tag,
      search,
      skip = 0,
      take = 6,
      sort = 'newest',
    }: {
      category?: string;
      tag?: string;
      search?: string;
      skip?: number;
      take?: number;
      sort?: 'newest' | 'oldest';
    } = {},
  ) {
    const limit = Math.min(Math.max(take, 1), 48);

    let tagFilteredIds: string[] | undefined;
    if (tag) {
      const assignments = await this.prisma.tagAssignment.findMany({
        where: { organizationId: orgId, entityType: 'blog', tag: { slug: tag } },
        select: { entityId: true },
      });
      tagFilteredIds = assignments.map((a) => a.entityId);
      if (tagFilteredIds.length === 0) {
        return { data: [], total: 0, skip, take: limit, hasMore: false };
      }
    }

    const where = {
      organizationId: orgId,
      published: true,
      visibility: 'public',
      ...(category && { category: { contains: category } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tagFilteredIds && { id: { in: tagFilteredIds } }),
    };

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { blogFeaturedEnabled: true, blogPinToTopEnabled: true },
    });

    const orderBy =
      sort === 'oldest'
        ? [{ publishedAt: 'asc' as const }]
        : org?.blogPinToTopEnabled
          ? [{ pinToTop: 'desc' as const }, { publishedAt: 'desc' as const }]
          : [{ publishedAt: 'desc' as const }];

    const [rows, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        select: DomainsService.PUBLIC_BLOG_SELECT,
        orderBy,
        skip: Math.max(skip, 0),
        take: limit,
      }),
      this.prisma.blog.count({ where }),
    ]);

    const clamped = rows.map((b) => ({
      ...b,
      isFeatured: b.isFeatured && (org?.blogFeaturedEnabled ?? true),
      pinToTop: b.pinToTop && (org?.blogPinToTopEnabled ?? true),
    }));
    const data = await this.tagsService.attachTags(orgId, 'blog', clamped);

    return { data, total, skip, take: limit, hasMore: skip + data.length < total };
  }

  private static readonly PUBLIC_BLOG_DETAIL_SELECT = {
    id: true,
    title: true,
    subtitle: true,
    slug: true,
    body: true,
    excerpt: true,
    coverImage: true,
    author: true,
    category: true,
    seoTitle: true,
    metaDesc: true,
    keywords: true,
    publishedAt: true,
    isFeatured: true,
    allowComments: true,
  } as const;

  /**
   * Single published, publicly-visible blog post by slug, for the storefront
   * /blog/[slug] page. 404s for drafts, scheduled, private/members-only
   * posts, or posts belonging to a different org.
   */
  async getPublicBlogBySlug(orgId: string, slug: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { organizationId: orgId, slug, published: true, visibility: 'public' },
      select: DomainsService.PUBLIC_BLOG_DETAIL_SELECT,
    });
    if (!blog) throw new NotFoundException('Post not found');

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { blogCommentsEnabled: true, blogFeaturedEnabled: true },
    });

    const clamped = {
      ...blog,
      isFeatured: blog.isFeatured && (org?.blogFeaturedEnabled ?? true),
      allowComments: blog.allowComments && (org?.blogCommentsEnabled ?? true),
    };
    return this.tagsService.attachTagsOne(orgId, 'blog', clamped);
  }

  /** Categories, popular tags, and recent posts for the /blog page's sidebar. */
  async getPublicBlogFacets(orgId: string) {
    const visibleWhere = { organizationId: orgId, published: true, visibility: 'public' };

    const [categories, visibleBlogs, recentPosts] = await Promise.all([
      this.prisma.blogCategory.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.blog.findMany({ where: visibleWhere, select: { id: true } }),
      this.prisma.blog.findMany({
        where: visibleWhere,
        select: { title: true, slug: true, coverImage: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
    ]);

    const assignments = await this.prisma.tagAssignment.findMany({
      where: { organizationId: orgId, entityType: 'blog', entityId: { in: visibleBlogs.map((b) => b.id) } },
      include: { tag: true },
    });
    const tagCounts = new Map<string, number>();
    for (const a of assignments) {
      tagCounts.set(a.tag.name, (tagCounts.get(a.tag.name) ?? 0) + 1);
    }
    const tags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    return { categories, tags, recentPosts };
  }

  /**
   * Everything the storefront /blog page needs from CMS → Page Settings:
   * SEO meta, Open Graph, favicon, injected scripts/CSS, the configured page
   * size, and sidebar section visibility — mirrors
   * getPublicProductListingSettings but for the "blog-listing" page type.
   */
  async getPublicBlogListingSettings(orgId: string) {
    const settings = await this.prisma.systemPageSettings.findUnique({
      where: { organizationId_pageType: { organizationId: orgId, pageType: 'blog-listing' } },
    });
    const custom = (settings?.customSettings as Record<string, unknown> | null) ?? {};
    const postsPerPage = Number(custom.postsPerPage);
    const boolOr = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);

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
      postsPerPage: Number.isFinite(postsPerPage) && postsPerPage > 0 ? postsPerPage : 6,
      showSidebar: boolOr(custom.showSidebar, true),
      showSearch: boolOr(custom.showSearch, true),
      showCategories: boolOr(custom.showCategories, true),
      showTags: boolOr(custom.showTags, true),
    };
  }

  async getPublicForm(orgId: string, slug: string) {
    const [form, org] = await Promise.all([
      this.prisma.cmsForm.findFirst({
        where: { organizationId: orgId, slug, status: 'Published' },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          fields: true,
          captchaEnabled: true,
          submitButton: true,
          settings: true,
        },
      }),
      this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { recaptchaEnabled: true },
      }),
    ]);
    if (!form) throw new NotFoundException('Form not found');
    return { ...form, captchaEnabled: form.captchaEnabled && !!org?.recaptchaEnabled };
  }

  async submitPublicForm(
    orgId: string,
    slug: string,
    data: Record<string, unknown>,
  ) {
    const { captchaToken, ...fields } = data as { captchaToken?: string } & Record<string, unknown>;

    const [form, org] = await Promise.all([
      this.prisma.cmsForm.findFirst({
        where: { organizationId: orgId, slug, status: 'Published' },
        select: { id: true, captchaEnabled: true },
      }),
      this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { recaptchaEnabled: true },
      }),
    ]);
    if (!form) throw new NotFoundException('Form not found');

    if (form.captchaEnabled && org?.recaptchaEnabled) {
      const result = await verifyRecaptcha(captchaToken);
      if (!result.success) {
        throw new BadRequestException('reCAPTCHA verification failed. Please try again.');
      }
    }

    await this.prisma.cmsFormSubmission.create({
      data: { formId: form.id, data: fields as object },
    });
    return { ok: true };
  }

  async submitContactForm(orgId: string, dto: SubmitContactFormDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { recaptchaEnabled: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    if (org.recaptchaEnabled) {
      const result = await verifyRecaptcha(dto.captchaToken);
      if (!result.success) {
        throw new BadRequestException('reCAPTCHA verification failed. Please try again.');
      }
    }

    await this.prisma.contactSubmission.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
      },
    });
    return { ok: true };
  }

  async subscribeToNewsletter(orgId: string, dto: SubscribeNewsletterDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { recaptchaEnabled: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    if (org.recaptchaEnabled) {
      const result = await verifyRecaptcha(dto.captchaToken);
      if (!result.success) {
        throw new BadRequestException('reCAPTCHA verification failed. Please try again.');
      }
    }

    const name = dto.name?.trim() || deriveNameFromEmail(dto.email);

    await this.prisma.newsletterSubscriber.upsert({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
      create: { organizationId: orgId, email: dto.email, name },
      update: {},
    });
    return { ok: true };
  }

  // ── Comments (blog/page/product discussion — polymorphic, see Comment model) ─

  /**
   * Whether comments are currently allowed for a resource. For "blog" this is
   * the same blog.allowComments && org.blogCommentsEnabled clamp used by
   * getPublicBlogBySlug — the global Settings toggle always wins. Page/product
   * have no per-resource toggle yet (no editor UI exposes one), so they're
   * allowed by default; the schema/API stay ready for that later.
   */
  private async resourceAllowsComments(
    orgId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<boolean> {
    if (resourceType === 'blog') {
      const [blog, org] = await Promise.all([
        this.prisma.blog.findFirst({
          where: { id: resourceId, organizationId: orgId },
          select: { allowComments: true },
        }),
        this.prisma.organization.findUnique({
          where: { id: orgId },
          select: { blogCommentsEnabled: true },
        }),
      ]);
      if (!blog) return false;
      return blog.allowComments && (org?.blogCommentsEnabled ?? true);
    }
    return true;
  }

  async getPublicComments(orgId: string, resourceType: string, resourceId: string) {
    if (!(COMMENT_RESOURCE_TYPES as readonly string[]).includes(resourceType)) {
      throw new BadRequestException('Invalid resource type');
    }
    if (!resourceId) throw new BadRequestException('resourceId is required');

    const allowed = await this.resourceAllowsComments(orgId, resourceType, resourceId);
    if (!allowed) return [];

    const all = await this.prisma.comment.findMany({
      where: { organizationId: orgId, resourceType, resourceId, status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, parentId: true, body: true, authorName: true, rating: true, createdAt: true },
    });

    const byParent = new Map<string | null, typeof all>();
    for (const c of all) {
      const key = c.parentId;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    }
    const attachReplies = (c: (typeof all)[number]): unknown => ({
      ...c,
      replies: (byParent.get(c.id) ?? []).map(attachReplies),
    });
    return (byParent.get(null) ?? []).map(attachReplies);
  }

  async submitPublicComment(orgId: string, dto: SubmitCommentDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { recaptchaEnabled: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const allowed = await this.resourceAllowsComments(orgId, dto.resourceType, dto.resourceId);
    if (!allowed) throw new BadRequestException('Comments are disabled for this content');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: {
          id: dto.parentId,
          organizationId: orgId,
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
        },
      });
      if (!parent) throw new BadRequestException('Invalid parent comment');
    }

    if (org.recaptchaEnabled) {
      const result = await verifyRecaptcha(dto.captchaToken);
      if (!result.success) {
        throw new BadRequestException('reCAPTCHA verification failed. Please try again.');
      }
    }

    await this.prisma.comment.create({
      data: {
        organizationId: orgId,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        parentId: dto.parentId,
        authorName: dto.authorName,
        authorEmail: dto.authorEmail,
        body: dto.body,
        rating: dto.resourceType === 'product' ? dto.rating : undefined,
        status: 'PENDING',
      },
    });
    return { ok: true, status: 'PENDING' as const };
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
      googleAnalyticsId: true,
      googleSiteVerification: true,
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
    googleAnalyticsId?: string | null;
    googleSiteVerification?: string | null;
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
      googleAnalyticsId: org.googleAnalyticsId ?? null,
      googleSiteVerification: org.googleSiteVerification ?? null,
    };
  }
}
