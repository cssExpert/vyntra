import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createProductDto: CreateProductDto) {
    const { slug, sku, ...data } = createProductDto;

    // Check for duplicate slug and SKU
    const existing = await this.prisma.product.findFirst({
      where: {
        organizationId,
        OR: [{ slug }, { sku }],
      },
    });

    if (existing) {
      throw new BadRequestException(
        existing.slug === slug ? 'Slug already exists' : 'SKU already exists'
      );
    }

    return this.prisma.product.create({
      data: {
        organizationId,
        slug,
        sku,
        ...data,
      },
      include: {
        variants: true,
        media: true,
      },
    });
  }

  async findAll(
    organizationId: string,
    {
      skip = 0,
      take = 10,
      status,
      categoryId,
      type,
    }: {
      skip?: number;
      take?: number;
      status?: string;
      categoryId?: string;
      type?: string;
    } = {}
  ) {
    const where = {
      organizationId,
      ...(status && { status }),
      ...(categoryId && { categoryIds: { has: categoryId } }),
      ...(type && { type }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          variants: true,
          media: true,
          _count: {
            select: { orderItems: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findBySlug(organizationId: string, slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        organizationId_slug: { organizationId, slug },
      },
      include: {
        variants: true,
        media: true,
        reviews: {
          include: {
            customer: true,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findById(organizationId: string, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        media: true,
        reviews: true,
      },
    });

    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(organizationId: string, id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findById(organizationId, id);
    const data = updateProductDto as any;

    // Check for slug/SKU conflicts
    if (data.slug && data.slug !== product.slug) {
      const existing = await this.prisma.product.findFirst({
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

    if (data.sku && data.sku !== product.sku) {
      const existing = await this.prisma.product.findFirst({
        where: {
          organizationId,
          sku: data.sku,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('SKU already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        variants: true,
        media: true,
      },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findById(organizationId, id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(organizationId: string, productId: string, quantity: number) {
    await this.findById(organizationId, productId);

    return this.prisma.product.update({
      where: { id: productId },
      data: { stock: quantity },
    });
  }

  // ─── Product Media ──────────────────────────────────────────────────────────

  async addMedia(
    organizationId: string,
    productId: string,
    dto: { url: string; type?: string; alt?: string; isPrimary?: boolean; sortOrder?: number },
  ) {
    await this.findById(organizationId, productId);

    const count = await this.prisma.productMedia.count({ where: { productId } });
    const isFirst = count === 0;

    return this.prisma.productMedia.create({
      data: {
        productId,
        url:       dto.url,
        type:      dto.type      ?? 'image',
        alt:       dto.alt       ?? null,
        isPrimary: dto.isPrimary ?? isFirst,
        sortOrder: dto.sortOrder ?? count,
      },
    });
  }

  async removeMedia(organizationId: string, productId: string, mediaId: string) {
    await this.findById(organizationId, productId);

    const item = await this.prisma.productMedia.findFirst({
      where: { id: mediaId, productId },
    });
    if (!item) throw new NotFoundException('Media not found');

    await this.prisma.productMedia.delete({ where: { id: mediaId } });

    // If the deleted item was primary, promote the first remaining
    if (item.isPrimary) {
      const first = await this.prisma.productMedia.findFirst({
        where:   { productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (first) {
        await this.prisma.productMedia.update({
          where: { id: first.id },
          data:  { isPrimary: true },
        });
      }
    }

    return { id: mediaId };
  }

  async setPrimaryMedia(organizationId: string, productId: string, mediaId: string) {
    await this.findById(organizationId, productId);

    const item = await this.prisma.productMedia.findFirst({
      where: { id: mediaId, productId },
    });
    if (!item) throw new NotFoundException('Media not found');

    await this.prisma.productMedia.updateMany({
      where: { productId },
      data:  { isPrimary: false },
    });
    return this.prisma.productMedia.update({
      where: { id: mediaId },
      data:  { isPrimary: true },
    });
  }

  async reorderMedia(organizationId: string, productId: string, orderedIds: string[]) {
    await this.findById(organizationId, productId);

    await Promise.all(
      orderedIds.map((id, index) =>
        this.prisma.productMedia.updateMany({
          where: { id, productId },
          data:  { sortOrder: index },
        }),
      ),
    );

    return { ok: true };
  }
}
