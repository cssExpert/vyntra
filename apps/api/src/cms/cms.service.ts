import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';
import { verifyRecaptcha } from '../common/recaptcha';

// Slugs reserved for app-driven storefront system pages (kept in sync with
// apps/web/src/lib/themes/systemPages.ts) — a CMS page can never use these,
// since the site router resolves them to a system page first.
const RESERVED_SYSTEM_SLUGS = new Set(['shop']);

interface MenuItemInput {
  label: string;
  url: string;
  target?: string;
  visibility?: string[];
}

interface BlogDto {
  title: string;
  subtitle?: string;
  slug: string;
  body?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  category?: string;
  seoTitle?: string;
  metaDesc?: string;
  keywords?: string;
  published?: boolean;
  publishedAt?: string | null;
  visibility?: string;
  allowComments?: boolean;
  isFeatured?: boolean;
  pinToTop?: boolean;
}

interface FooterColumn {
  title: string;
  menuId: string;
}

interface LayoutDto {
  name?: string;
  isDefault?: boolean;
  navMenuId?: string | null;
  footerColumns?: FooterColumn[];
}

@Injectable()
export class CmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagsService: TagsService,
  ) {}

  // ── Pages ────────────────────────────────────────────────────────────────────

  async listPages(orgId: string) {
    return this.prisma.page.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        isLandingPage: true,
        layoutId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { title: 'asc' },
    });
  }

  async listBlogs(
    orgId: string,
    {
      category,
      sort = 'newest',
      take,
      published,
    }: {
      category?: string;
      sort?: 'newest' | 'oldest';
      take?: number;
      published?: boolean;
    } = {},
  ) {
    return this.prisma.blog.findMany({
      where: {
        organizationId: orgId,
        ...(category && { category: { contains: category } }),
        ...(published !== undefined && { published }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        author: true,
        excerpt: true,
        coverImage: true,
        category: true,
        createdAt: true,
        publishedAt: true,
      },
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
      ...(take !== undefined && { take }),
    });
  }

  async getDashboardStats(orgId: string) {
    const now = new Date();

    const [blogs, categories, tags, pages, media, blogTagAssignments] = await Promise.all([
      this.prisma.blog.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          publishedAt: true,
          isFeatured: true,
          coverImage: true,
          category: true,
          author: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogCategory.count({ where: { organizationId: orgId } }),
      this.prisma.tag.count({ where: { organizationId: orgId } }),
      this.prisma.page.findMany({
        where: { organizationId: orgId },
        select: { published: true },
      }),
      this.prisma.media.count({ where: { organizationId: orgId } }),
      this.prisma.tagAssignment.findMany({
        where: { organizationId: orgId, entityType: 'blog' },
        include: { tag: true },
      }),
    ]);

    const published = blogs.filter((b) => b.published).length;
    const scheduled = blogs.filter(
      (b) => !b.published && b.publishedAt && new Date(b.publishedAt) > now,
    ).length;
    const drafts = blogs.length - published - scheduled;
    const featured = blogs.filter((b) => b.isFeatured).length;

    // Category distribution from blog.category field (comma-separated)
    const catCount: Record<string, number> = {};
    for (const blog of blogs) {
      if (!blog.category) continue;
      for (const cat of blog.category.split(',').map((c: string) => c.trim()).filter(Boolean)) {
        catCount[cat] = (catCount[cat] ?? 0) + 1;
      }
    }
    const topCategories = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Tag distribution from the shared tag catalog's blog assignments
    const tagCount: Record<string, number> = {};
    for (const { tag } of blogTagAssignments) {
      tagCount[tag.name] = (tagCount[tag.name] ?? 0) + 1;
    }
    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return {
      totalBlogs: blogs.length,
      published,
      drafts,
      scheduled,
      featured,
      totalCategories: categories,
      totalTags: tags,
      totalPages: pages.length,
      publishedPages: pages.filter((p) => p.published).length,
      totalMedia: media,
      recentBlogs: blogs.slice(0, 6).map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        published: b.published,
        publishedAt: b.publishedAt,
        coverImage: b.coverImage,
        author: b.author,
        createdAt: b.createdAt,
      })),
      topCategories,
      topTags,
    };
  }

  /**
   * Clamps a blog's comments/featured/pin-to-top fields to the org's current
   * feature switches (CMS Settings → Blog), without touching the stored
   * value — so re-enabling a switch restores whatever each post already had.
   */
  private async clampBlogFeatures<T extends { allowComments: boolean; isFeatured: boolean; pinToTop: boolean }>(
    orgId: string,
    blog: T,
  ): Promise<T> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { blogCommentsEnabled: true, blogFeaturedEnabled: true, blogPinToTopEnabled: true },
    });
    return {
      ...blog,
      allowComments: blog.allowComments && (org?.blogCommentsEnabled ?? true),
      isFeatured: blog.isFeatured && (org?.blogFeaturedEnabled ?? true),
      pinToTop: blog.pinToTop && (org?.blogPinToTopEnabled ?? true),
    };
  }

  async getBlog(orgId: string, id: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    const withTags = await this.tagsService.attachTagsOne(orgId, 'blog', blog);
    return this.clampBlogFeatures(orgId, withTags);
  }

  async createBlog(orgId: string, dto: BlogDto) {
    const existing = await this.prisma.blog.findFirst({
      where: { organizationId: orgId, slug: dto.slug },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('A blog with this slug already exists');

    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        slug: dto.slug,
        body: dto.body,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        author: dto.author,
        category: dto.category,
        seoTitle: dto.seoTitle,
        metaDesc: dto.metaDesc,
        keywords: dto.keywords,
        published: dto.published ?? false,
        publishedAt: dto.published
          ? (dto.publishedAt ? new Date(dto.publishedAt) : new Date())
          : (dto.publishedAt ? new Date(dto.publishedAt) : null),
        visibility: dto.visibility ?? 'public',
        allowComments: dto.allowComments ?? true,
        isFeatured: dto.isFeatured ?? false,
        pinToTop: dto.pinToTop ?? false,
        organizationId: orgId,
      },
    });

    await this.tagsService.syncAssignments(orgId, 'blog', blog.id, dto.tags ?? []);
    const withTags = await this.tagsService.attachTagsOne(orgId, 'blog', blog);
    return this.clampBlogFeatures(orgId, withTags);
  }

  async updateBlog(orgId: string, id: string, dto: Partial<BlogDto>) {
    const blog = await this.prisma.blog.findFirst({ where: { id, organizationId: orgId } });
    if (!blog) throw new NotFoundException('Blog not found');

    if (dto.slug && dto.slug !== blog.slug) {
      const conflict = await this.prisma.blog.findFirst({
        where: { organizationId: orgId, slug: dto.slug, id: { not: id } },
        select: { id: true },
      });
      if (conflict) throw new BadRequestException('A blog with this slug already exists');
    }

    const updated = await this.prisma.blog.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.author !== undefined && { author: dto.author }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.metaDesc !== undefined && { metaDesc: dto.metaDesc }),
        ...(dto.keywords !== undefined && { keywords: dto.keywords }),
        ...(dto.published !== undefined && { published: dto.published }),
        ...(dto.publishedAt !== undefined
          ? { publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null }
          : dto.published === true && !blog.publishedAt
            ? { publishedAt: new Date() }
            : {}),
        ...(dto.visibility !== undefined && { visibility: dto.visibility }),
        ...(dto.allowComments !== undefined && { allowComments: dto.allowComments }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.pinToTop !== undefined && { pinToTop: dto.pinToTop }),
      },
    });

    if (dto.tags !== undefined) {
      await this.tagsService.syncAssignments(orgId, 'blog', id, dto.tags);
    }
    const withTags = await this.tagsService.attachTagsOne(orgId, 'blog', updated);
    return this.clampBlogFeatures(orgId, withTags);
  }

  async deleteBlog(orgId: string, id: string) {
    const blog = await this.prisma.blog.findFirst({ where: { id, organizationId: orgId } });
    if (!blog) throw new NotFoundException('Blog not found');
    await this.tagsService.removeAssignmentsFor(orgId, 'blog', id);
    await this.prisma.blog.delete({ where: { id } });
    return { ok: true };
  }

  // ── Blog Categories ──────────────────────────────────────────────────────────

  async listBlogCategories(orgId: string) {
    return this.prisma.blogCategory.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    });
  }

  async createBlogCategory(orgId: string, dto: { name: string; slug: string; description?: string }) {
    const existing = await this.prisma.blogCategory.findFirst({
      where: { organizationId: orgId, slug: dto.slug },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('A category with this slug already exists');
    return this.prisma.blogCategory.create({
      data: { name: dto.name, slug: dto.slug, description: dto.description, organizationId: orgId },
    });
  }

  async updateBlogCategory(orgId: string, id: string, dto: { name?: string; slug?: string; description?: string }) {
    const cat = await this.prisma.blogCategory.findFirst({ where: { id, organizationId: orgId } });
    if (!cat) throw new NotFoundException('Category not found');
    if (dto.slug && dto.slug !== cat.slug) {
      const conflict = await this.prisma.blogCategory.findFirst({
        where: { organizationId: orgId, slug: dto.slug, id: { not: id } },
        select: { id: true },
      });
      if (conflict) throw new BadRequestException('A category with this slug already exists');
    }
    return this.prisma.blogCategory.update({ where: { id }, data: dto });
  }

  async deleteBlogCategory(orgId: string, id: string) {
    const cat = await this.prisma.blogCategory.findFirst({ where: { id, organizationId: orgId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.prisma.blogCategory.delete({ where: { id } });
    return { ok: true };
  }

  async loadPage(orgId: string, slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { organizationId: orgId, slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        metaDesc: true,
        metaKeywords: true,
        noIndex: true,
        published: true,
        publishedAt: true,
        isLandingPage: true,
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
    return { ...page, themeIdentifier: page.theme?.identifier ?? null };
  }

  /**
   * Saves Page Settings fields (SEO/OG/Social/Favicon/Scripts/Styles) only.
   * Deliberately separate from `savePage`, which owns `content` — mixing the
   * two let a settings-only save clobber the page's blocks with an empty
   * content string.
   */
  async updatePageSettings(
    orgId: string,
    slug: string,
    dto: {
      title?: string;
      metaDesc?: string;
      metaKeywords?: string;
      noIndex?: boolean;
      ogTitle?: string;
      ogDescription?: string;
      ogType?: string;
      ogUrl?: string;
      ogImage?: string | null;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string | null;
      twitterCardSize?: string;
      faviconUrl?: string | null;
      headScript?: string;
      bodyScript?: string;
      customCss?: string;
    },
  ) {
    const existing = await this.prisma.page.findFirst({
      where: { organizationId: orgId, slug },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Page not found');

    return this.prisma.page.update({ where: { id: existing.id }, data: dto });
  }

  async savePage(
    orgId: string,
    slug: string,
    dto: { content: string; publish?: boolean; layoutId?: string | null; themeId?: string | null },
  ) {
    if (RESERVED_SYSTEM_SLUGS.has(slug)) {
      throw new BadRequestException(
        `"/${slug}" is reserved for the storefront's built-in shop page and can't be used for a CMS page.`,
      );
    }

    const existing = await this.prisma.page.findFirst({
      where: { organizationId: orgId, slug },
      select: { id: true },
    });

    const updateData = {
      content: dto.content,
      ...(dto.publish ? { published: true, publishedAt: new Date() } : {}),
      ...('layoutId' in dto ? { layoutId: dto.layoutId ?? null } : {}),
      ...('themeId' in dto ? { themeId: dto.themeId ?? null } : {}),
    };

    if (existing) {
      return this.prisma.page.update({ where: { id: existing.id }, data: updateData });
    }

    return this.prisma.page.create({
      data: {
        ...updateData,
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        organizationId: orgId,
        published: dto.publish ?? false,
        publishedAt: dto.publish ? new Date() : null,
      },
    });
  }

  async bulkUpdatePageLayout(orgId: string, pageIds: string[], layoutId: string | null) {
    await this.prisma.page.updateMany({
      where: { id: { in: pageIds }, organizationId: orgId },
      data: { layoutId },
    });
    return { ok: true, updated: pageIds.length };
  }

  // ── Page Translations ─────────────────────────────────────────────────────────

  async listPageTranslations(orgId: string, pageId: string) {
    const page = await this.prisma.page.findFirst({ where: { id: pageId, organizationId: orgId }, select: { id: true } });
    if (!page) throw new NotFoundException('Page not found');
    return this.prisma.pageTranslation.findMany({ where: { pageId }, orderBy: { lang: 'asc' } });
  }

  async upsertPageTranslation(
    orgId: string,
    pageId: string,
    lang: string,
    dto: { title: string; content?: string | null; metaDesc?: string | null; metaKeywords?: string | null },
  ) {
    const page = await this.prisma.page.findFirst({ where: { id: pageId, organizationId: orgId }, select: { id: true } });
    if (!page) throw new NotFoundException('Page not found');
    return this.prisma.pageTranslation.upsert({
      where: { pageId_lang: { pageId, lang } },
      create: { pageId, lang, ...dto },
      update: dto,
    });
  }

  async deletePage(orgId: string, pageId: string) {
    const page = await this.prisma.page.findFirst({ where: { id: pageId, organizationId: orgId }, select: { id: true } });
    if (!page) throw new NotFoundException('Page not found');
    await this.prisma.page.delete({ where: { id: pageId } });
    return { ok: true };
  }

  async deletePageTranslation(orgId: string, pageId: string, lang: string) {
    const page = await this.prisma.page.findFirst({ where: { id: pageId, organizationId: orgId }, select: { id: true } });
    if (!page) throw new NotFoundException('Page not found');
    await this.prisma.pageTranslation.deleteMany({ where: { pageId, lang } });
    return { ok: true };
  }

  // ── Theme Installer ──────────────────────────────────────────────────────────

  async getThemeInstallPreview(orgId: string, identifier: string) {
    const { SHOPINGO_PAGES, SHOPINGO_MENUS, SHOPINGO_LAYOUT } = await import('./shopingo-installer');
    const pages = identifier === 'shopingo' ? SHOPINGO_PAGES : [];
    const menus = identifier === 'shopingo' ? SHOPINGO_MENUS : [];

    const [existingPageSlugs, existingMenuSlugs, existingLayout] = await Promise.all([
      this.prisma.page.findMany({
        where: { organizationId: orgId, slug: { in: pages.map((p) => p.slug) } },
        select: { slug: true },
      }).then((r) => new Set(r.map((p) => p.slug))),
      this.prisma.menu.findMany({
        where: { organizationId: orgId, slug: { in: menus.map((m) => m.slug) } },
        select: { slug: true },
      }).then((r) => new Set(r.map((m) => m.slug))),
      this.prisma.layout.findFirst({
        where: { organizationId: orgId, name: SHOPINGO_LAYOUT.name },
        select: { id: true },
      }),
    ]);

    return {
      pages: pages.map((p) => ({
        slug: p.slug,
        title: p.title,
        metaDesc: p.metaDesc,
        isLandingPage: p.isLandingPage,
        exists: existingPageSlugs.has(p.slug),
      })),
      menus: menus.map((m) => ({
        slug: m.slug,
        name: m.name,
        menuType: m.menuType,
        role: m.role,
        itemCount: m.items.length,
        exists: existingMenuSlugs.has(m.slug),
      })),
      layout: {
        name: identifier === 'shopingo' ? SHOPINGO_LAYOUT.name : '',
        exists: !!existingLayout,
      },
    };
  }

  async installTheme(
    orgId: string,
    identifier: string,
    dto: { pageSlugs: string[]; installMenus: boolean; installLayout: boolean; overwrite: boolean },
  ) {
    const { SHOPINGO_PAGES, SHOPINGO_MENUS, SHOPINGO_LAYOUT } = await import('./shopingo-installer');
    const allPages = identifier === 'shopingo' ? SHOPINGO_PAGES : [];
    const allMenus = identifier === 'shopingo' ? SHOPINGO_MENUS : [];

    const themeRecord = await this.prisma.theme.findFirst({
      where: { identifier },
      select: { id: true },
    });

    const result = {
      pages: { installed: [] as string[], skipped: [] as string[] },
      menus: { installed: [] as string[], skipped: [] as string[] },
      layout: null as string | null,
    };

    // ── Install pages ─────────────────────────────────────────────────────────
    const targetPages = allPages.filter((p) => dto.pageSlugs.includes(p.slug));
    for (const def of targetPages) {
      const existing = await this.prisma.page.findFirst({
        where: { organizationId: orgId, slug: def.slug },
        select: { id: true },
      });

      if (existing && !dto.overwrite) {
        result.pages.skipped.push(def.slug);
        continue;
      }

      const content = JSON.stringify(def.blocks);
      if (existing) {
        await this.prisma.page.update({
          where: { id: existing.id },
          data: { content, published: true, publishedAt: new Date(), themeId: themeRecord?.id ?? null },
        });
      } else {
        if (def.isLandingPage) {
          await this.prisma.page.updateMany({
            where: { organizationId: orgId, isLandingPage: true },
            data: { isLandingPage: false },
          });
        }
        await this.prisma.page.create({
          data: {
            slug: def.slug, title: def.title, metaDesc: def.metaDesc,
            isLandingPage: def.isLandingPage, content, published: true,
            publishedAt: new Date(), organizationId: orgId, themeId: themeRecord?.id ?? null,
          },
        });
      }
      result.pages.installed.push(def.slug);
    }

    // ── Install menus ─────────────────────────────────────────────────────────
    if (dto.installMenus) {
      for (const def of allMenus) {
        const existing = await this.prisma.menu.findFirst({
          where: { organizationId: orgId, slug: def.slug },
          select: { id: true },
        });

        if (existing && !dto.overwrite) {
          result.menus.skipped.push(def.name);
          continue;
        }

        if (existing) {
          await this.prisma.menuItem.deleteMany({ where: { menuId: existing.id } });
          await this.prisma.menu.update({
            where: { id: existing.id },
            data: { name: def.name, menuType: def.menuType },
          });
          await this.prisma.menuItem.createMany({
            data: def.items.map((item) => ({ ...item, menuId: existing.id })),
          });
        } else {
          await this.prisma.menu.create({
            data: {
              slug: def.slug, name: def.name, menuType: def.menuType,
              organizationId: orgId, visibility: ['all'],
              items: { createMany: { data: def.items } },
            },
          });
        }
        result.menus.installed.push(def.name);
      }
    }

    // ── Install layout ────────────────────────────────────────────────────────
    if (dto.installLayout) {
      const navMenu = await this.prisma.menu.findFirst({
        where: { organizationId: orgId, slug: SHOPINGO_LAYOUT.navMenuSlug },
        select: { id: true },
      });

      const footerColumnMenus = await Promise.all(
        SHOPINGO_LAYOUT.footerColumns.map((col) =>
          this.prisma.menu.findFirst({
            where: { organizationId: orgId, slug: col.menuSlug },
            select: { id: true },
          }).then((m) => ({ title: col.title, menuId: m?.id ?? '' })),
        ),
      );

      const existingLayout = await this.prisma.layout.findFirst({
        where: { organizationId: orgId, name: SHOPINGO_LAYOUT.name },
        select: { id: true },
      });

      // Set all layouts to non-default before creating/updating
      await this.prisma.layout.updateMany({
        where: { organizationId: orgId },
        data: { isDefault: false },
      });

      if (existingLayout) {
        await this.prisma.layout.update({
          where: { id: existingLayout.id },
          data: {
            navMenuId: navMenu?.id ?? null,
            footerColumns: footerColumnMenus.filter((c) => c.menuId) as object,
            isDefault: true,
          },
        });
      } else {
        await this.prisma.layout.create({
          data: {
            name: SHOPINGO_LAYOUT.name, isDefault: true, organizationId: orgId,
            navMenuId: navMenu?.id ?? null,
            footerColumns: footerColumnMenus.filter((c) => c.menuId) as object,
          },
        });
      }
      result.layout = SHOPINGO_LAYOUT.name;
    }

    return result;
  }

  // ── Layouts ──────────────────────────────────────────────────────────────────

  async listLayouts(orgId: string) {
    return this.prisma.layout.findMany({
      where: { organizationId: orgId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async createLayout(orgId: string, dto: LayoutDto) {
    if (dto.isDefault) {
      await this.prisma.layout.updateMany({
        where: { organizationId: orgId },
        data: { isDefault: false },
      });
    }
    return this.prisma.layout.create({
      data: {
        name: dto.name ?? 'Untitled Layout',
        isDefault: dto.isDefault ?? false,
        navMenuId: dto.navMenuId ?? null,
        footerColumns: (dto.footerColumns ?? []) as object,
        organizationId: orgId,
      },
    });
  }

  async getLayout(orgId: string, id: string) {
    const layout = await this.prisma.layout.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!layout) throw new NotFoundException('Layout not found');
    return layout;
  }

  async updateLayout(orgId: string, id: string, dto: LayoutDto) {
    const layout = await this.prisma.layout.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!layout) throw new NotFoundException('Layout not found');

    if (dto.isDefault) {
      await this.prisma.layout.updateMany({
        where: { organizationId: orgId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.layout.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.navMenuId !== undefined && { navMenuId: dto.navMenuId }),
        ...(dto.footerColumns !== undefined && {
          footerColumns: dto.footerColumns as object,
        }),
      },
    });
  }

  async deleteLayout(orgId: string, id: string) {
    const layout = await this.prisma.layout.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!layout) throw new NotFoundException('Layout not found');
    await this.prisma.layout.delete({ where: { id } });
    return { ok: true };
  }

  // ── Menus ────────────────────────────────────────────────────────────────────

  async listMenus(orgId: string) {
    return this.prisma.menu.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMenu(orgId: string, dto: { name: string; slug: string; visibility: string[]; menuType?: string }) {
    return this.prisma.menu.create({
      data: { ...dto, menuType: dto.menuType ?? 'navigation', organizationId: orgId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async getMenu(orgId: string, id: string) {
    const menu = await this.prisma.menu.findFirst({
      where: { id, organizationId: orgId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async updateMenu(
    orgId: string,
    id: string,
    dto: { name?: string; slug?: string; visibility?: string[]; menuType?: string },
  ) {
    const menu = await this.prisma.menu.findFirst({ where: { id, organizationId: orgId } });
    if (!menu) throw new NotFoundException('Menu not found');
    return this.prisma.menu.update({
      where: { id },
      data: dto,
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async deleteMenu(orgId: string, id: string) {
    const menu = await this.prisma.menu.findFirst({ where: { id, organizationId: orgId } });
    if (!menu) throw new NotFoundException('Menu not found');
    await this.prisma.menu.delete({ where: { id } });
    return { ok: true };
  }

  async setMenuItems(orgId: string, menuId: string, items: MenuItemInput[]) {
    const menu = await this.prisma.menu.findFirst({ where: { id: menuId, organizationId: orgId } });
    if (!menu) throw new NotFoundException('Menu not found');
    await this.prisma.menuItem.deleteMany({ where: { menuId } });
    if (items.length > 0) {
      await this.prisma.menuItem.createMany({
        data: items.map((item, i) => ({
          label: item.label,
          url: item.url,
          target: item.target ?? '_self',
          visibility: item.visibility ?? ['all'],
          order: i,
          menuId,
        })),
      });
    }
    return this.getMenu(orgId, menuId);
  }

  // ── CMS Forms ────────────────────────────────────────────────────────────────

  private formatForm(f: { id: string; name: string; description: string | null; slug: string; status: string; fields: unknown; captchaEnabled: boolean; createdAt: Date; updatedAt: Date; _count: { submissions: number } }) {
    return {
      id: f.id,
      name: f.name,
      description: f.description ?? '',
      slug: f.slug,
      status: f.status,
      fields: f.fields,
      captchaEnabled: f.captchaEnabled,
      responses: f._count.submissions,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    };
  }

  async listForms(orgId: string) {
    const forms = await this.prisma.cmsForm.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return forms.map((f) => this.formatForm(f));
  }

  async getFormById(orgId: string, id: string) {
    const form = await this.prisma.cmsForm.findFirst({
      where: { id, organizationId: orgId },
      include: { _count: { select: { submissions: true } } },
    });
    if (!form) throw new NotFoundException('Form not found');
    return this.formatForm(form);
  }

  async createForm(orgId: string, dto: { name: string; description?: string; slug: string; status?: string; fields?: unknown[]; captchaEnabled?: boolean }) {
    const form = await this.prisma.cmsForm.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug: dto.slug,
        status: dto.status ?? 'Draft',
        fields: (dto.fields ?? []) as object,
        captchaEnabled: dto.captchaEnabled ?? false,
        organizationId: orgId,
      },
      include: { _count: { select: { submissions: true } } },
    });
    return this.formatForm(form);
  }

  async updateForm(orgId: string, id: string, dto: { name?: string; description?: string; slug?: string; status?: string; fields?: unknown[]; captchaEnabled?: boolean }) {
    const existing = await this.prisma.cmsForm.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Form not found');
    const form = await this.prisma.cmsForm.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.fields !== undefined && { fields: dto.fields as object }),
        ...(dto.captchaEnabled !== undefined && { captchaEnabled: dto.captchaEnabled }),
      },
      include: { _count: { select: { submissions: true } } },
    });
    return this.formatForm(form);
  }

  async deleteFormById(orgId: string, id: string) {
    const existing = await this.prisma.cmsForm.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Form not found');
    await this.prisma.cmsForm.delete({ where: { id } });
    return { ok: true };
  }

  async duplicateForm(orgId: string, id: string) {
    const source = await this.prisma.cmsForm.findFirst({ where: { id, organizationId: orgId } });
    if (!source) throw new NotFoundException('Form not found');
    const form = await this.prisma.cmsForm.create({
      data: {
        name: `${source.name} (Copy)`,
        description: source.description,
        slug: `${source.slug}-copy-${Date.now()}`,
        status: 'Draft',
        fields: source.fields as object,
        captchaEnabled: source.captchaEnabled,
        organizationId: orgId,
      },
      include: { _count: { select: { submissions: true } } },
    });
    return this.formatForm(form);
  }

  async verifyCaptcha(token: string): Promise<{ success: boolean; errorCodes?: string[] }> {
    return verifyRecaptcha(token);
  }

  // ── Contact Requests (storefront Contact Form / Contact Form + Info blocks) ─

  async listContactSubmissions(orgId: string) {
    return this.prisma.contactSubmission.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateContactSubmissionStatus(orgId: string, id: string, status: string) {
    const existing = await this.prisma.contactSubmission.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Contact request not found');
    return this.prisma.contactSubmission.update({ where: { id }, data: { status } });
  }

  async deleteContactSubmission(orgId: string, id: string) {
    const existing = await this.prisma.contactSubmission.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Contact request not found');
    await this.prisma.contactSubmission.delete({ where: { id } });
    return { ok: true };
  }

  // ── Newsletter Subscribers (storefront footer newsletter signup) ───────────

  async listNewsletterSubscribers(orgId: string) {
    return this.prisma.newsletterSubscriber.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteNewsletterSubscriber(orgId: string, id: string) {
    const existing = await this.prisma.newsletterSubscriber.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Subscriber not found');
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
    return { ok: true };
  }
}
