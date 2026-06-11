import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  headerVariant?: string;
  footerVariant?: string;
}

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listBlogs(orgId: string) {
    return this.prisma.blog.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        author: true,
        createdAt: true,
        publishedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboardStats(orgId: string) {
    const now = new Date();

    const [blogs, categories, tags, pages, media] = await Promise.all([
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
          tags: true,
          author: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogCategory.count({ where: { organizationId: orgId } }),
      this.prisma.blogTag.count({ where: { organizationId: orgId } }),
      this.prisma.page.findMany({
        where: { organizationId: orgId },
        select: { published: true },
      }),
      this.prisma.media.count({ where: { organizationId: orgId } }),
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

    // Tag distribution from blog.tags array field
    const tagCount: Record<string, number> = {};
    for (const blog of blogs) {
      for (const tag of (blog.tags ?? [])) {
        const t = tag.trim();
        if (t) tagCount[t] = (tagCount[t] ?? 0) + 1;
      }
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

  async getBlog(orgId: string, id: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async createBlog(orgId: string, dto: BlogDto) {
    const existing = await this.prisma.blog.findFirst({
      where: { organizationId: orgId, slug: dto.slug },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('A blog with this slug already exists');

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        slug: dto.slug,
        body: dto.body,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        tags: dto.tags ?? [],
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

    return this.prisma.blog.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
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
  }

  async deleteBlog(orgId: string, id: string) {
    const blog = await this.prisma.blog.findFirst({ where: { id, organizationId: orgId } });
    if (!blog) throw new NotFoundException('Blog not found');
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

  // ── Blog Tags ────────────────────────────────────────────────────────────────

  async listBlogTags(orgId: string) {
    return this.prisma.blogTag.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    });
  }

  async findOrCreateBlogTag(orgId: string, name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.prisma.blogTag.findFirst({
      where: { organizationId: orgId, slug },
    });
    if (existing) return existing;
    return this.prisma.blogTag.create({
      data: { name, slug, organizationId: orgId },
    });
  }

  async deleteBlogTag(orgId: string, id: string) {
    const tag = await this.prisma.blogTag.findFirst({ where: { id, organizationId: orgId } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.prisma.blogTag.delete({ where: { id } });
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
        published: true,
        publishedAt: true,
        isLandingPage: true,
        layoutId: true,
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async savePage(
    orgId: string,
    slug: string,
    dto: { content: string; publish?: boolean; layoutId?: string | null },
  ) {
    const existing = await this.prisma.page.findFirst({
      where: { organizationId: orgId, slug },
      select: { id: true },
    });

    const updateData = {
      content: dto.content,
      ...(dto.publish ? { published: true, publishedAt: new Date() } : {}),
      ...('layoutId' in dto ? { layoutId: dto.layoutId ?? null } : {}),
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

  async deletePageTranslation(orgId: string, pageId: string, lang: string) {
    const page = await this.prisma.page.findFirst({ where: { id: pageId, organizationId: orgId }, select: { id: true } });
    if (!page) throw new NotFoundException('Page not found');
    await this.prisma.pageTranslation.deleteMany({ where: { pageId, lang } });
    return { ok: true };
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
        headerVariant: dto.headerVariant ?? 'minimal',
        footerVariant: dto.footerVariant ?? 'columns',
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
        ...(dto.headerVariant !== undefined && { headerVariant: dto.headerVariant }),
        ...(dto.footerVariant !== undefined && { footerVariant: dto.footerVariant }),
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
}
