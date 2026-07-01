import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';

const INCLUDE = {
  values: { orderBy: { sortOrder: 'asc' as const } },
} as const;

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const data = await this.prisma.storeAttribute.findMany({
      where: { organizationId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return { data, total: data.length };
  }

  async findById(organizationId: string, id: string) {
    const attr = await this.prisma.storeAttribute.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!attr || attr.organizationId !== organizationId) {
      throw new NotFoundException('Attribute not found');
    }
    return attr;
  }

  async create(organizationId: string, dto: CreateAttributeDto) {
    const existing = await this.prisma.storeAttribute.findFirst({
      where: { organizationId, name: dto.name },
    });
    if (existing) throw new BadRequestException('Attribute name already exists');

    return this.prisma.storeAttribute.create({
      data: {
        organizationId,
        name: dto.name,
        attributeType: dto.attributeType ?? 'selection',
        fieldType: dto.fieldType ?? 'dropdown',
        usedInVariation: dto.usedInVariation ?? false,
        values: {
          create: (dto.options ?? []).map((o, i) => ({
            name: o.name,
            colorHex: o.colorHex ?? null,
            sortOrder: o.sortOrder ?? i,
          })),
        },
      },
      include: INCLUDE,
    });
  }

  async update(organizationId: string, id: string, dto: UpdateAttributeDto) {
    await this.findById(organizationId, id);

    if (dto.name) {
      const conflict = await this.prisma.storeAttribute.findFirst({
        where: { organizationId, name: dto.name, id: { not: id } },
      });
      if (conflict) throw new BadRequestException('Attribute name already exists');
    }

    // Replace all values when options are provided
    if (dto.options !== undefined) {
      await this.prisma.storeAttributeValue.deleteMany({ where: { attributeId: id } });
    }

    return this.prisma.storeAttribute.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.attributeType !== undefined && { attributeType: dto.attributeType }),
        ...(dto.fieldType !== undefined && { fieldType: dto.fieldType }),
        ...(dto.usedInVariation !== undefined && { usedInVariation: dto.usedInVariation }),
        ...(dto.options !== undefined && {
          values: {
            create: dto.options.map((o, i) => ({
              name: o.name,
              colorHex: o.colorHex ?? null,
              sortOrder: o.sortOrder ?? i,
            })),
          },
        }),
      },
      include: INCLUDE,
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findById(organizationId, id);
    return this.prisma.storeAttribute.delete({ where: { id } });
  }
}
