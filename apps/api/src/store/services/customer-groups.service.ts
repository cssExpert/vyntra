import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto,
  UpdateCustomerGroupRestrictionsDto,
  UpdateProductTierPricesDto,
} from '../dto';
import { resolveVisibility } from '../utils/customer-group-resolution';

const RESTRICTIONS_INCLUDE = {
  categories: true,
  products: { include: { product: { select: { id: true, name: true, sku: true } } } },
  pages: true,
  paymentMethods: true,
  shippingMethods: true,
  onlineGateways: true,
} as const;

const MAX_PATTERN_LENGTH = 200;
// Rejects a quantified group directly followed by another quantifier, e.g. (a+)+, (a*)*, (a+)* —
// the classic shape that causes exponential-time regex backtracking on non-matching input.
const CATASTROPHIC_PATTERN_RE = /\([^()]*[+*]\)[+*]/;

// Case/whitespace normalization so "Card" and "card" resolve to the same slug — these are matched
// against real gateway/shipping-provider slugs (always lowercase) once storefront wiring lands.
function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

@Injectable()
export class CustomerGroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const groups = await this.prisma.customerGroup.findMany({
      where: { organizationId },
      include: {
        _count: { select: { customers: true, tierPrices: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { data: groups, total: groups.length };
  }

  async findById(organizationId: string, id: string) {
    const group = await this.prisma.customerGroup.findUnique({
      where: { id },
      include: {
        _count: { select: { customers: true, tierPrices: true } },
      },
    });
    if (!group || group.organizationId !== organizationId) {
      throw new NotFoundException('Customer group not found');
    }
    return group;
  }

  async create(organizationId: string, dto: CreateCustomerGroupDto) {
    const existing = await this.prisma.customerGroup.findFirst({
      where: { organizationId, name: dto.name },
    });
    if (existing) throw new BadRequestException('Customer group name already exists');

    this.assertValidDiscount(dto.discountType, dto.discountValue);
    this.assertValidOrderRange(dto.minOrderValue, dto.maxOrderValue);

    return this.prisma.customerGroup.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        requiresApproval: dto.requiresApproval ?? false,
        minOrderValue: dto.minOrderValue,
        maxOrderValue: dto.maxOrderValue,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateCustomerGroupDto) {
    const group = await this.findById(organizationId, id);

    if (dto.name && dto.name !== group.name) {
      const conflict = await this.prisma.customerGroup.findFirst({
        where: { organizationId, name: dto.name, id: { not: id } },
      });
      if (conflict) throw new BadRequestException('Customer group name already exists');
    }

    // `undefined` = field untouched, keep validating against the existing value.
    // `null` = explicit clear — must NOT fall back to the existing value via `??`.
    const effectiveDiscountType = dto.discountType !== undefined ? dto.discountType : group.discountType;
    const effectiveDiscountValue = dto.discountValue !== undefined ? dto.discountValue : group.discountValue;
    this.assertValidDiscount(effectiveDiscountType, effectiveDiscountValue);

    const effectiveMinOrderValue = dto.minOrderValue !== undefined ? dto.minOrderValue : group.minOrderValue;
    const effectiveMaxOrderValue = dto.maxOrderValue !== undefined ? dto.maxOrderValue : group.maxOrderValue;
    this.assertValidOrderRange(effectiveMinOrderValue, effectiveMaxOrderValue);

    return this.prisma.customerGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.discountType !== undefined && { discountType: dto.discountType }),
        // Clearing discountType also clears discountValue so a stale number never lingers
        // behind a "None" discount, even if the caller didn't explicitly send discountValue: null.
        ...(dto.discountValue !== undefined
          ? { discountValue: dto.discountValue }
          : dto.discountType === null
            ? { discountValue: null }
            : {}),
        ...(dto.requiresApproval !== undefined && { requiresApproval: dto.requiresApproval }),
        ...(dto.minOrderValue !== undefined && { minOrderValue: dto.minOrderValue }),
        ...(dto.maxOrderValue !== undefined && { maxOrderValue: dto.maxOrderValue }),
      },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findById(organizationId, id);
    return this.prisma.customerGroup.delete({ where: { id } });
  }

  async getRestrictions(organizationId: string, id: string) {
    const group = await this.prisma.customerGroup.findUnique({
      where: { id },
      include: RESTRICTIONS_INCLUDE,
    });
    if (!group || group.organizationId !== organizationId) {
      throw new NotFoundException('Customer group not found');
    }

    return {
      categoriesMode: group.categoriesMode,
      categoryIds: group.categories.map((row) => row.categoryId),
      productsMode: group.productsMode,
      productIds: group.products.map((row) => row.productId),
      productItems: group.products.map((row) => row.product),
      productPattern: group.productPattern,
      pagesMode: group.pagesMode,
      pageIds: group.pages.map((row) => row.pageId),
      paymentMethodsMode: group.paymentMethodsMode,
      paymentMethodSlugs: group.paymentMethods.map((row) => row.methodSlug),
      shippingMethodsMode: group.shippingMethodsMode,
      shippingMethodSlugs: group.shippingMethods.map((row) => row.methodSlug),
      onlineGatewaysMode: group.onlineGatewaysMode,
      onlineGatewaySlugs: group.onlineGateways.map((row) => row.gatewaySlug),
    };
  }

  async updateRestrictions(
    organizationId: string,
    id: string,
    dto: UpdateCustomerGroupRestrictionsDto,
  ) {
    await this.findById(organizationId, id);

    if (dto.productPattern) {
      this.assertSafePattern(dto.productPattern);
    }

    if (dto.categoryIds !== undefined) {
      await this.assertCategoriesOwnership(organizationId, dto.categoryIds);
    }
    if (dto.productIds !== undefined) {
      await this.assertProductsOwnership(organizationId, dto.productIds);
    }
    if (dto.pageIds !== undefined) {
      await this.assertPagesOwnership(organizationId, dto.pageIds);
    }

    const paymentMethodSlugs = dto.paymentMethodSlugs?.map(normalizeSlug);
    const shippingMethodSlugs = dto.shippingMethodSlugs?.map(normalizeSlug);
    const onlineGatewaySlugs = dto.onlineGatewaySlugs?.map(normalizeSlug);

    await this.prisma.$transaction(async (tx) => {
      await tx.customerGroup.update({
        where: { id },
        data: {
          ...(dto.categoriesMode !== undefined && { categoriesMode: dto.categoriesMode }),
          ...(dto.productsMode !== undefined && { productsMode: dto.productsMode }),
          ...(dto.productPattern !== undefined && { productPattern: dto.productPattern }),
          ...(dto.pagesMode !== undefined && { pagesMode: dto.pagesMode }),
          ...(dto.paymentMethodsMode !== undefined && { paymentMethodsMode: dto.paymentMethodsMode }),
          ...(dto.shippingMethodsMode !== undefined && { shippingMethodsMode: dto.shippingMethodsMode }),
          ...(dto.onlineGatewaysMode !== undefined && { onlineGatewaysMode: dto.onlineGatewaysMode }),
        },
      });

      if (dto.categoryIds !== undefined) {
        await tx.customerGroupCategory.deleteMany({ where: { customerGroupId: id } });
        await tx.customerGroupCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({ customerGroupId: id, categoryId })),
        });
      }

      if (dto.productIds !== undefined) {
        await tx.customerGroupProduct.deleteMany({ where: { customerGroupId: id } });
        await tx.customerGroupProduct.createMany({
          data: dto.productIds.map((productId) => ({ customerGroupId: id, productId })),
        });
      }

      if (dto.pageIds !== undefined) {
        await tx.customerGroupPage.deleteMany({ where: { customerGroupId: id } });
        await tx.customerGroupPage.createMany({
          data: dto.pageIds.map((pageId) => ({ customerGroupId: id, pageId })),
        });
      }

      if (paymentMethodSlugs !== undefined) {
        await tx.customerGroupPaymentMethod.deleteMany({ where: { customerGroupId: id } });
        await tx.customerGroupPaymentMethod.createMany({
          data: [...new Set(paymentMethodSlugs)].map((methodSlug) => ({ customerGroupId: id, methodSlug })),
        });
      }

      if (shippingMethodSlugs !== undefined) {
        await tx.customerGroupShippingMethod.deleteMany({ where: { customerGroupId: id } });
        await tx.customerGroupShippingMethod.createMany({
          data: [...new Set(shippingMethodSlugs)].map((methodSlug) => ({ customerGroupId: id, methodSlug })),
        });
      }

      if (onlineGatewaySlugs !== undefined) {
        await tx.customerGroupOnlineGateway.deleteMany({ where: { customerGroupId: id } });
        await tx.customerGroupOnlineGateway.createMany({
          data: [...new Set(onlineGatewaySlugs)].map((gatewaySlug) => ({ customerGroupId: id, gatewaySlug })),
        });
      }
    });

    return this.getRestrictions(organizationId, id);
  }

  async searchProducts(organizationId: string, query: string) {
    return this.prisma.product.findMany({
      where: {
        organizationId,
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, name: true, sku: true, price: true },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async previewPattern(organizationId: string, id: string, pattern: string) {
    await this.findById(organizationId, id);
    this.assertSafePattern(pattern);

    const products = await this.prisma.product.findMany({
      where: { organizationId },
      select: { id: true, name: true, sku: true },
    });

    const matches = products.filter((product) =>
      resolveVisibility('only_selected', [], product.id, {
        pattern,
        patternCandidates: [product.name, product.sku],
      }),
    );

    return { count: matches.length, matches: matches.slice(0, 20) };
  }

  async getTierPrices(organizationId: string, productId: string) {
    await this.assertProductOwnership(organizationId, productId);
    return this.prisma.productTierPrice.findMany({
      where: { productId },
      orderBy: { minQty: 'asc' },
    });
  }

  async updateTierPrices(
    organizationId: string,
    productId: string,
    dto: UpdateProductTierPricesDto,
  ) {
    await this.assertProductOwnership(organizationId, productId);

    const seen = new Set<string>();
    for (const row of dto.rows) {
      const key = `${row.customerGroupId ?? 'any'}:${row.minQty}`;
      if (seen.has(key)) {
        throw new BadRequestException(
          `Duplicate tier price for min qty ${row.minQty} in the same group`,
        );
      }
      seen.add(key);
    }

    const groupIds = dto.rows
      .map((row) => row.customerGroupId)
      .filter((groupId): groupId is string => !!groupId);
    await this.assertCustomerGroupsOwnership(organizationId, groupIds);

    await this.prisma.$transaction(async (tx) => {
      await tx.productTierPrice.deleteMany({ where: { productId } });
      if (dto.rows.length > 0) {
        await tx.productTierPrice.createMany({
          data: dto.rows.map((row) => ({
            organizationId,
            productId,
            customerGroupId: row.customerGroupId ?? null,
            minQty: row.minQty,
            price: row.price,
          })),
        });
      }
    });

    return this.getTierPrices(organizationId, productId);
  }

  private async assertProductOwnership(organizationId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('Product not found');
    }
  }

  private async assertCategoriesOwnership(organizationId: string, categoryIds: string[]) {
    if (categoryIds.length === 0) return;
    const ids = [...new Set(categoryIds)];
    const count = await this.prisma.productCategory.count({ where: { id: { in: ids }, organizationId } });
    if (count !== ids.length) {
      throw new BadRequestException('One or more categories do not belong to this organization');
    }
  }

  private async assertProductsOwnership(organizationId: string, productIds: string[]) {
    if (productIds.length === 0) return;
    const ids = [...new Set(productIds)];
    const count = await this.prisma.product.count({ where: { id: { in: ids }, organizationId } });
    if (count !== ids.length) {
      throw new BadRequestException('One or more products do not belong to this organization');
    }
  }

  private async assertPagesOwnership(organizationId: string, pageIds: string[]) {
    if (pageIds.length === 0) return;
    const ids = [...new Set(pageIds)];
    const count = await this.prisma.page.count({ where: { id: { in: ids }, organizationId } });
    if (count !== ids.length) {
      throw new BadRequestException('One or more pages do not belong to this organization');
    }
  }

  private async assertCustomerGroupsOwnership(organizationId: string, groupIds: string[]) {
    if (groupIds.length === 0) return;
    const ids = [...new Set(groupIds)];
    const count = await this.prisma.customerGroup.count({ where: { id: { in: ids }, organizationId } });
    if (count !== ids.length) {
      throw new BadRequestException('One or more customer groups do not belong to this organization');
    }
  }

  private assertSafePattern(pattern: string) {
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new BadRequestException(`Pattern must be ${MAX_PATTERN_LENGTH} characters or fewer`);
    }
    if (CATASTROPHIC_PATTERN_RE.test(pattern)) {
      throw new BadRequestException(
        'Pattern contains a nested quantifier that could cause catastrophic backtracking',
      );
    }
    try {
      new RegExp(pattern);
    } catch {
      throw new BadRequestException('Invalid product pattern');
    }
  }

  private assertValidDiscount(
    discountType: string | null | undefined,
    discountValue: number | null | undefined,
  ) {
    if (!discountType || discountType === 'none') return;
    if (discountValue == null) {
      throw new BadRequestException('Discount value is required when a discount type is set');
    }
    if (discountType === 'percentage' && discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100');
    }
  }

  private assertValidOrderRange(
    minOrderValue: number | null | undefined,
    maxOrderValue: number | null | undefined,
  ) {
    if (minOrderValue != null && maxOrderValue != null && maxOrderValue < minOrderValue) {
      throw new BadRequestException('Max order value cannot be less than min order value');
    }
  }
}
