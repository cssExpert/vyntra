import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from '../dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createCategoryDto: CreateProductCategoryDto) {
    const { slug, parentId, ...data } = createCategoryDto;

    // Check for duplicate slug
    const existing = await this.prisma.productCategory.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existing) {
      throw new BadRequestException('Slug already exists');
    }

    // Verify parent category exists if provided
    if (parentId) {
      const parent = await this.prisma.productCategory.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.organizationId !== organizationId) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.productCategory.create({
      data: {
        organizationId,
        slug,
        parentId,
        ...data,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(
    organizationId: string,
    {
      skip = 0,
      take = 10,
      status,
      parentId,
    }: { skip?: number; take?: number; status?: string; parentId?: string } = {}
  ) {
    const where = {
      organizationId,
      ...(status && { status }),
      ...(parentId !== undefined && { parentId: parentId || null }),
    };

    const [data, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        skip,
        take,
        include: {
          parent: true,
          children: true,
        },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.productCategory.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findById(organizationId: string, id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category || category.organizationId !== organizationId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(organizationId: string, slug: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: {
        organizationId_slug: { organizationId, slug },
      },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    organizationId: string,
    id: string,
    updateCategoryDto: UpdateProductCategoryDto
  ) {
    const category = await this.findById(organizationId, id);
    const data = updateCategoryDto as any;

    // Check for slug conflicts
    if (data.slug && data.slug !== category.slug) {
      const existing = await this.prisma.productCategory.findFirst({
        where: {
          organizationId,
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Slug already exists');
      }
    }

    // Verify parent category if changed
    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      if (data.parentId) {
        const parent = await this.prisma.productCategory.findUnique({
          where: { id: data.parentId },
        });

        if (!parent || parent.organizationId !== organizationId) {
          throw new BadRequestException('Parent category not found');
        }

        // Prevent circular hierarchy
        if (await this.hasDescendant(id, data.parentId)) {
          throw new BadRequestException('Cannot set a descendant as parent');
        }
      }
    }

    return this.prisma.productCategory.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(organizationId: string, id: string) {
    const category = await this.findById(organizationId, id);

    // Check if category has children
    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    return this.prisma.productCategory.delete({
      where: { id },
    });
  }

  async getHierarchy(organizationId: string) {
    return this.prisma.productCategory.findMany({
      where: {
        organizationId,
        parentId: null,
      },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async hasDescendant(categoryId: string, potentialDescendantId: string): Promise<boolean> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: { children: true },
    });

    if (!category) return false;

    for (const child of category.children) {
      if (child.id === potentialDescendantId) return true;
      if (await this.hasDescendant(child.id, potentialDescendantId)) return true;
    }

    return false;
  }
}
