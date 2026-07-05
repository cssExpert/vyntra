import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, SystemPageSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemPageSettingsDto } from './dto/update-system-page-settings.dto';

/**
 * System pages are app-driven storefront routes (product listing, product detail, …)
 * as opposed to CMS pages. Keep this list in sync with SYSTEM_PAGE_ROUTES in
 * apps/web/src/lib/themes/systemPages.ts.
 */
export const SYSTEM_PAGE_TYPES = ['product-listing', 'blog-listing'] as const;
export type SystemPageType = (typeof SYSTEM_PAGE_TYPES)[number];

export function assertValidPageType(pageType: string): asserts pageType is SystemPageType {
  if (!SYSTEM_PAGE_TYPES.includes(pageType as SystemPageType)) {
    throw new BadRequestException(`Unknown system page type: ${pageType}`);
  }
}

/**
 * Strip DB-only columns (id, organizationId, pageType, timestamps) so the response
 * matches UpdateSystemPageSettingsDto's shape exactly — the frontend round-trips
 * this object straight back on save, and the global ValidationPipe's
 * forbidNonWhitelisted rejects any property the DTO doesn't declare.
 */
function toDto(settings: SystemPageSettings | null): UpdateSystemPageSettingsDto {
  return {
    metaTitle: settings?.metaTitle ?? undefined,
    metaDesc: settings?.metaDesc ?? undefined,
    metaKeywords: settings?.metaKeywords ?? undefined,
    noIndex: settings?.noIndex ?? false,
    ogTitle: settings?.ogTitle ?? undefined,
    ogDescription: settings?.ogDescription ?? undefined,
    ogType: settings?.ogType ?? 'website',
    ogUrl: settings?.ogUrl ?? undefined,
    ogImage: settings?.ogImage ?? undefined,
    faviconUrl: settings?.faviconUrl ?? undefined,
    customSettings: (settings?.customSettings as Record<string, unknown> | null) ?? {},
    headScript: settings?.headScript ?? undefined,
    bodyScript: settings?.bodyScript ?? undefined,
    customCss: settings?.customCss ?? undefined,
  };
}

@Injectable()
export class SystemPageSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(organizationId: string, pageType: string) {
    assertValidPageType(pageType);
    const settings = await this.prisma.systemPageSettings.findUnique({
      where: { organizationId_pageType: { organizationId, pageType } },
    });
    return toDto(settings);
  }

  async update(organizationId: string, pageType: string, dto: UpdateSystemPageSettingsDto) {
    assertValidPageType(pageType);
    const data = { ...dto, customSettings: dto.customSettings as Prisma.InputJsonValue | undefined };
    const settings = await this.prisma.systemPageSettings.upsert({
      where: { organizationId_pageType: { organizationId, pageType } },
      create: { organizationId, pageType, ...data },
      update: data,
    });
    return toDto(settings);
  }
}
