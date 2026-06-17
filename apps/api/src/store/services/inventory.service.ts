import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInventoryDto } from '../dto';
import { StoreJobsService } from './store-jobs.service';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private storeJobs: StoreJobsService,
  ) {}

  async initializeProductInventory(
    organizationId: string,
    productId: string,
    stock: number = 0,
    warehouseLocation?: string
  ) {
    // Check if inventory already exists
    const existing = await this.prisma.inventory.findFirst({
      where: {
        organizationId,
        productId,
        variantId: null as any,
      },
    });

    if (existing) {
      throw new BadRequestException('Inventory already initialized for this product');
    }

    return this.prisma.inventory.create({
      data: {
        organizationId,
        productId,
        stock,
        warehouseLocation,
      },
    });
  }

  async findAll(
    organizationId: string,
    { skip = 0, take = 10, status }: { skip?: number; take?: number; status?: string } = {}
  ) {
    const where: any = {
      organizationId,
    };

    if (status === 'out') {
      where.stock = 0;
    }

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        skip,
        take,
        include: {
          product: true,
        },
        orderBy: { lastUpdated: 'desc' },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findByProductId(organizationId: string, productId: string, variantId?: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        organizationId,
        productId,
        variantId: variantId || (null as any),
      },
      include: {
        product: true,
        history: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async updateStock(
    organizationId: string,
    productId: string,
    updateInventoryDto: UpdateInventoryDto,
    variantId?: string
  ) {
    const inventory = await this.findByProductId(organizationId, productId, variantId);
    const previousStock = inventory.stock;
    const quantityChange = updateInventoryDto.stock - previousStock;

    // Update inventory
    const updated = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        stock: updateInventoryDto.stock,
        lastUpdated: new Date(),
        ...(updateInventoryDto.warehouseLocation && {
          warehouseLocation: updateInventoryDto.warehouseLocation,
        }),
      },
      include: {
        product: true,
      },
    });

    // Record history
    await this.prisma.inventoryHistory.create({
      data: {
        inventoryId: inventory.id,
        quantity: quantityChange,
        reason: updateInventoryDto.reason || 'Manual adjustment',
        notes: updateInventoryDto.notes,
      },
    });

    // Update product stock
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: updateInventoryDto.stock,
      },
    });

    return updated;
  }

  async adjustStock(
    organizationId: string,
    productId: string,
    quantityChange: number,
    reason: string,
    notes?: string,
    variantId?: string
  ) {
    const inventory = await this.findByProductId(organizationId, productId, variantId);
    const newStock = Math.max(0, inventory.stock + quantityChange);

    const result = await this.updateStock(
      organizationId,
      productId,
      {
        stock: newStock,
        reason,
        notes,
      },
      variantId
    );

    // Queue inventory reconciliation asynchronously (fire-and-forget)
    // Run after a short delay to allow related operations to complete
    this.storeJobs.queueInventoryReconciliation(organizationId).catch((error) => {
      console.error(`Failed to queue inventory reconciliation for ${organizationId}:`, error);
    });

    return result;
  }

  async decrementStock(
    organizationId: string,
    productId: string,
    quantity: number,
    variantId?: string
  ) {
    const inventory = await this.findByProductId(organizationId, productId, variantId);

    if (inventory.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.adjustStock(
      organizationId,
      productId,
      -quantity,
      'Order fulfillment',
      undefined,
      variantId
    );
  }

  async incrementStock(
    organizationId: string,
    productId: string,
    quantity: number,
    reason: string = 'Stock replenishment',
    variantId?: string
  ) {
    return this.adjustStock(
      organizationId,
      productId,
      quantity,
      reason,
      undefined,
      variantId
    );
  }

  async getInventoryHistory(
    organizationId: string,
    productId: string,
    { skip = 0, take = 20 }: { skip?: number; take?: number } = {}
  ) {
    const inventory = await this.findByProductId(organizationId, productId);

    const [data, total] = await Promise.all([
      this.prisma.inventoryHistory.findMany({
        where: { inventoryId: inventory.id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryHistory.count({
        where: { inventoryId: inventory.id },
      }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async getLowStockItems(organizationId: string, threshold?: number) {
    const items = await this.prisma.inventory.findMany({
      where: {
        organizationId,
        stock: {
          lte: threshold || 10,
        },
      },
      include: {
        product: true,
      },
      orderBy: { stock: 'asc' },
    });

    return items;
  }

  async getOutOfStockItems(organizationId: string) {
    const items = await this.prisma.inventory.findMany({
      where: {
        organizationId,
        stock: 0,
      },
      include: {
        product: true,
      },
    });

    return items;
  }

  async getInventoryValue(organizationId: string) {
    const items = await this.prisma.inventory.findMany({
      where: { organizationId },
      include: {
        product: true,
      },
    });

    const totalValue = items.reduce((sum, item) => {
      return sum + item.stock * (item.product.costPrice || 0);
    }, 0);

    return {
      items: items.length,
      totalUnits: items.reduce((sum, item) => sum + item.stock, 0),
      totalValue,
    };
  }
}
