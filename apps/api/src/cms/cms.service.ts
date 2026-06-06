import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
