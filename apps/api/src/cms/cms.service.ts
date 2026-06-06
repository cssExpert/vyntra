import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MenuItemInput {
  label: string;
  url: string;
  target?: string;
  visibility?: string[];
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
          visibility: item.visibility ?? ['all'],
          order: i,
          menuId,
        })),
      });
    }
    return this.getMenu(orgId, menuId);
  }
}
