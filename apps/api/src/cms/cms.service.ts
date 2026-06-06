import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MenuItemInput {
  label: string;
  url: string;
  target?: string;
}

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPages(orgId: string) {
    return this.prisma.page.findMany({
      where: { organizationId: orgId },
      select: { id: true, title: true, slug: true, published: true },
      orderBy: { title: 'asc' },
    });
  }

  async listBlogs(orgId: string) {
    return this.prisma.blog.findMany({
      where: { organizationId: orgId },
      select: { id: true, title: true, slug: true, published: true },
      orderBy: { title: 'asc' },
    });
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
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async savePage(
    orgId: string,
    slug: string,
    dto: { content: string; publish?: boolean },
  ) {
    const existing = await this.prisma.page.findFirst({
      where: { organizationId: orgId, slug },
      select: { id: true },
    });

    const data = {
      content: dto.content,
      ...(dto.publish
        ? { published: true, publishedAt: new Date() }
        : {}),
    };

    if (existing) {
      return this.prisma.page.update({ where: { id: existing.id }, data });
    }

    return this.prisma.page.create({
      data: {
        ...data,
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        organizationId: orgId,
        published: dto.publish ?? false,
        publishedAt: dto.publish ? new Date() : null,
      },
    });
  }

  // ── Menu CRUD ─────────────────────────────────────────────────────────────

  async listMenus(orgId: string) {
    return this.prisma.menu.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMenu(orgId: string, dto: { name: string; slug: string; visibility: string[] }) {
    return this.prisma.menu.create({
      data: { ...dto, organizationId: orgId },
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
    dto: { name?: string; slug?: string; visibility?: string[] },
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
          order: i,
          menuId,
        })),
      });
    }
    return this.getMenu(orgId, menuId);
  }
}
