import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface BlockDto {
  name?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  blockType?: string;
  data?: Prisma.InputJsonValue;
  isGlobal?: boolean;
  themeIdentifier?: string | null;
  sortOrder?: number;
}

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    return this.prisma.block.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  }

  async create(dto: BlockDto) {
    return this.prisma.block.create({
      data: {
        name: dto.name ?? 'Untitled Block',
        description: dto.description,
        thumbnail: dto.thumbnail,
        category: dto.category,
        blockType: dto.blockType ?? 'custom-html',
        data: dto.data ?? {},
        isGlobal: dto.isGlobal ?? true,
        themeIdentifier: dto.isGlobal === false ? (dto.themeIdentifier ?? null) : null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: BlockDto) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    return this.prisma.block.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.blockType !== undefined && { blockType: dto.blockType }),
        ...(dto.data !== undefined && { data: dto.data }),
        ...(dto.isGlobal !== undefined && {
          isGlobal: dto.isGlobal,
          themeIdentifier: dto.isGlobal ? null : (dto.themeIdentifier ?? block.themeIdentifier),
        }),
        ...(dto.isGlobal === undefined && dto.themeIdentifier !== undefined && {
          themeIdentifier: dto.themeIdentifier,
        }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async delete(id: string) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    await this.prisma.block.delete({ where: { id } });
    return { ok: true };
  }
}
