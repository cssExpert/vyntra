import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface TemplateDto {
  name?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  isGlobal?: boolean;
  themeIdentifier?: string | null;
  blockIds?: string[];
}

const ADMIN_TEMPLATE_INCLUDE = {
  blocks: {
    orderBy: { sortOrder: 'asc' as const },
    include: { block: true },
  },
};

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Superadmin: full catalog + composition management ───────────────────────

  async listAllAdmin() {
    return this.prisma.template.findMany({
      orderBy: { createdAt: 'asc' },
      include: ADMIN_TEMPLATE_INCLUDE,
    });
  }

  async createAdmin(dto: TemplateDto) {
    const template = await this.prisma.template.create({
      data: {
        name: dto.name ?? 'Untitled Template',
        description: dto.description,
        thumbnail: dto.thumbnail,
        category: dto.category,
        isGlobal: dto.isGlobal ?? true,
        themeIdentifier: dto.isGlobal === false ? (dto.themeIdentifier ?? null) : null,
      },
    });
    if (dto.blockIds?.length) {
      await this.syncBlocks(template.id, dto.blockIds);
    }
    return this.prisma.template.findUnique({
      where: { id: template.id },
      include: ADMIN_TEMPLATE_INCLUDE,
    });
  }

  async updateAdmin(id: string, dto: TemplateDto) {
    const existing = await this.prisma.template.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template not found');

    await this.prisma.template.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.isGlobal !== undefined && {
          isGlobal: dto.isGlobal,
          themeIdentifier: dto.isGlobal ? null : (dto.themeIdentifier ?? existing.themeIdentifier),
        }),
        ...(dto.isGlobal === undefined && dto.themeIdentifier !== undefined && {
          themeIdentifier: dto.themeIdentifier,
        }),
      },
    });

    if (dto.blockIds !== undefined) {
      await this.syncBlocks(id, dto.blockIds);
    }

    return this.prisma.template.findUnique({ where: { id }, include: ADMIN_TEMPLATE_INCLUDE });
  }

  async deleteAdmin(id: string) {
    const existing = await this.prisma.template.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template not found');
    await this.prisma.template.delete({ where: { id } });
    return { ok: true };
  }

  /** Replaces a template's full block composition with the given ordered block ids. */
  private async syncBlocks(templateId: string, blockIds: string[]) {
    await this.prisma.$transaction([
      this.prisma.templateBlock.deleteMany({ where: { templateId } }),
      ...blockIds.map((blockId, index) =>
        this.prisma.templateBlock.create({
          data: { templateId, blockId, sortOrder: index },
        }),
      ),
    ]);
  }

  // ── Org-facing: templates available to the CMS page editor's picker ─────────

  async listForOrg(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { activeTheme: { select: { identifier: true } } },
    });
    const themeIdentifier = org?.activeTheme?.identifier ?? 'shopingo';

    const templates = await this.prisma.template.findMany({
      where: { OR: [{ isGlobal: true }, { themeIdentifier }] },
      orderBy: { createdAt: 'asc' },
      include: ADMIN_TEMPLATE_INCLUDE,
    });

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      thumbnail: t.thumbnail,
      category: t.category,
      blocks: t.blocks.map((tb) => ({
        blockType: tb.block.blockType,
        data: tb.block.data,
      })),
    }));
  }
}
