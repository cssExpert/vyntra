import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ThemeDto {
  name?: string;
  description?: string;
  thumbnail?: string;
  variables?: Record<string, string>;
}

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Global themes (superadmin) ───────────────────────────────────────────────

  async listGlobal() {
    return this.prisma.theme.findMany({
      where: { isGlobal: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createGlobal(dto: ThemeDto) {
    return this.prisma.theme.create({
      data: {
        name: dto.name ?? 'Untitled Theme',
        description: dto.description,
        thumbnail: dto.thumbnail,
        variables: (dto.variables ?? {}) as object,
        isGlobal: true,
        orgId: null,
      },
    });
  }

  async updateGlobal(id: string, dto: ThemeDto) {
    const theme = await this.prisma.theme.findFirst({ where: { id, isGlobal: true } });
    if (!theme) throw new NotFoundException('Global theme not found');
    return this.prisma.theme.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.variables !== undefined && { variables: dto.variables as object }),
      },
    });
  }

  async deleteGlobal(id: string) {
    const theme = await this.prisma.theme.findFirst({ where: { id, isGlobal: true } });
    if (!theme) throw new NotFoundException('Global theme not found');
    await this.prisma.theme.delete({ where: { id } });
    return { ok: true };
  }

  // ── Org themes (org admin) ───────────────────────────────────────────────────

  async listForOrg(orgId: string) {
    const [global, custom, org] = await Promise.all([
      this.prisma.theme.findMany({ where: { isGlobal: true }, orderBy: { createdAt: 'asc' } }),
      this.prisma.theme.findMany({ where: { orgId, isGlobal: false }, orderBy: { createdAt: 'asc' } }),
      this.prisma.organization.findUnique({ where: { id: orgId }, select: { activeThemeId: true } }),
    ]);
    return {
      activeThemeId: org?.activeThemeId ?? null,
      global,
      custom,
    };
  }

  async getActiveTheme(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { activeTheme: true },
    });
    return org?.activeTheme ?? null;
  }

  async createCustom(orgId: string, dto: ThemeDto) {
    return this.prisma.theme.create({
      data: {
        name: dto.name ?? 'Custom Theme',
        description: dto.description,
        thumbnail: dto.thumbnail,
        variables: (dto.variables ?? {}) as object,
        isGlobal: false,
        orgId,
      },
    });
  }

  async updateCustom(orgId: string, id: string, dto: ThemeDto) {
    const theme = await this.prisma.theme.findFirst({ where: { id, orgId, isGlobal: false } });
    if (!theme) throw new NotFoundException('Custom theme not found');
    return this.prisma.theme.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.variables !== undefined && { variables: dto.variables as object }),
      },
    });
  }

  async deleteCustom(orgId: string, id: string) {
    const theme = await this.prisma.theme.findFirst({ where: { id, orgId, isGlobal: false } });
    if (!theme) throw new NotFoundException('Custom theme not found');
    await this.prisma.theme.delete({ where: { id } });
    return { ok: true };
  }

  async activateTheme(orgId: string, id: string) {
    // Theme must be global OR belong to this org
    const theme = await this.prisma.theme.findFirst({
      where: { id, OR: [{ isGlobal: true }, { orgId }] },
    });
    if (!theme) throw new ForbiddenException('Theme not accessible');
    await this.prisma.organization.update({
      where: { id: orgId },
      data: { activeThemeId: id },
    });
    return { ok: true, activeThemeId: id };
  }

  async deactivateTheme(orgId: string) {
    await this.prisma.organization.update({
      where: { id: orgId },
      data: { activeThemeId: null },
    });
    return { ok: true, activeThemeId: null };
  }
}
