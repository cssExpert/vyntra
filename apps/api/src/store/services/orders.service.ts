import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { StoreJobsService } from './store-jobs.service';

/** Flattens ProductVariant.attributes ({"Size":"M","Color":"Red"}) into a display label ("M / Red"). */
function variantLabelFrom(attributes: unknown): string | null {
  if (!attributes || typeof attributes !== 'object') return null;
  const values = Object.values(attributes as Record<string, unknown>).filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );
  return values.length ? values.join(' / ') : null;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private storeJobs: StoreJobsService,
  ) {}

  async create(organizationId: string, createOrderDto: CreateOrderDto) {
    const { items, shippingAddress, billingAddress, ...orderData } = createOrderDto;

    // Verify customer exists
    const customer = await this.prisma.storeCustomer.findUnique({
      where: { id: createOrderDto.customerId },
    });

    if (!customer || customer.organizationId !== organizationId) {
      throw new BadRequestException('Customer not found');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber(organizationId);

    // Look up product (and variant, if specified) details to snapshot onto each line item
    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      include: { variants: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    // Stock check up front — before writing anything — so a caller gets a clean
    // 400 instead of a half-created order when something's oversold.
    for (const item of items) {
      const product = productById.get(item.productId);
      const variant = item.variantId ? product?.variants.find((v) => v.id === item.variantId) : undefined;
      const available = variant ? variant.stock : (product?.stock ?? 0);
      if (available < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product?.name ?? item.productId}`);
      }
    }

    // Order creation + address linking + stock decrement all happen atomically:
    // a public checkout endpoint reaches this with no moderation, so oversell
    // prevention has to hold even under concurrent requests for the same item.
    const orderId = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...orderData,
          organizationId,
          orderNumber,
          items: {
            create: items.map((item) => {
              const product = productById.get(item.productId);
              const variant = item.variantId
                ? product?.variants.find((v) => v.id === item.variantId)
                : undefined;
              return {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                productName: product?.name ?? '',
                sku: variant?.sku ?? product?.sku ?? '',
                imageUrl: variant?.imageUrl ?? product?.featuredImage ?? null,
                variantLabel: variant ? variantLabelFrom(variant.attributes) : null,
              };
            }),
          },
          timeline: {
            create: {
              status: 'pending',
              message: 'Order created',
            },
          },
        },
      });

      if (shippingAddress) {
        const addr = await tx.orderAddress.create({ data: shippingAddress as any });
        await tx.order.update({ where: { id: order.id }, data: { shippingAddressId: addr.id } });
      }
      if (billingAddress) {
        const addr = await tx.orderAddress.create({ data: billingAddress as any });
        await tx.order.update({ where: { id: order.id }, data: { billingAddressId: addr.id } });
      }

      // Decrements the denormalized Product/ProductVariant.stock fields (what
      // the storefront listing/detail pages and stockStatus actually read).
      // Deliberately does not also touch the separate Inventory/InventoryHistory
      // audit model here — InventoryService requires an initialized Inventory
      // row per product and isn't safe to assume exists for every product, so
      // wiring it into this transaction risked breaking checkout for products
      // that were never inventory-initialized. Admin Inventory view may drift
      // from Product.stock as a result; reconciling the two is a follow-up.
      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return order.id;
    });

    // Fetch complete order with addresses
    const completeOrder = await this.findById(organizationId, orderId);

    // Queue order confirmation email asynchronously (fire-and-forget)
    this.storeJobs.queueOrderConfirmation(orderId).catch((error) => {
      console.error(`Failed to queue order confirmation for ${orderId}:`, error);
    });

    return completeOrder;
  }

  async findAll(
    organizationId: string,
    {
      skip = 0,
      take = 10,
      status,
      customerId,
    }: { skip?: number; take?: number; status?: string; customerId?: string } = {}
  ) {
    const where = {
      organizationId,
      ...(status && { status }),
      ...(customerId && { customerId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          items: { include: { product: true } },
          customer: true,
          payments: true,
          timeline: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findById(organizationId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        refunds: { include: { items: true } },
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order || order.organizationId !== organizationId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByOrderNumber(organizationId: string, orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        organizationId_orderNumber: { organizationId, orderNumber },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(organizationId: string, id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findById(organizationId, id);

    // Add timeline entry if status changed
    const updateData = { ...updateOrderDto } as any;
    const timelineEntry =
      updateOrderDto.status && updateOrderDto.status !== order.status
        ? {
            timeline: {
              create: {
                status: updateOrderDto.status,
                message: `Order status changed to ${updateOrderDto.status}`,
              },
            },
          }
        : {};

    return this.prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        ...timelineEntry,
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        payments: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async updateStatus(
    organizationId: string,
    id: string,
    status: string,
    message?: string
  ) {
    const order = await this.findById(organizationId, id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        timeline: {
          create: {
            status,
            message: message || `Order status changed to ${status}`,
          },
        },
      },
      include: {
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Queue appropriate notifications based on status change
    if (status === 'shipped') {
      this.storeJobs.queueShipmentNotification(id).catch((error) => {
        console.error(`Failed to queue shipment notification for ${id}:`, error);
      });
    }

    return updatedOrder;
  }

  async cancel(organizationId: string, id: string, reason?: string) {
    const order = await this.findById(organizationId, id);

    if (['completed', 'cancelled'].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel order with status ${order.status}`);
    }

    return this.updateStatus(organizationId, id, 'cancelled', reason || 'Order cancelled');
  }

  async addPayment(
    organizationId: string,
    orderId: string,
    paymentData: { amount: number; method: string; transactionId?: string }
  ) {
    const order = await this.findById(organizationId, orderId);

    const payment = await this.prisma.payment.create({
      data: {
        organizationId,
        orderId,
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.transactionId,
        status: 'completed',
        currency: order.currencyCode,
      },
    });

    // Update order payment status if total matches
    const totalPaid = (
      await this.prisma.payment.aggregate({
        where: { orderId },
        _sum: { amount: true },
      })
    )._sum.amount || 0;

    if (totalPaid >= order.total) {
      await this.updateStatus(organizationId, orderId, 'paid');
    }

    return payment;
  }

  async recordRefund(
    organizationId: string,
    orderId: string,
    refundData: { amount: number; reason: string; items: Array<{ orderItemId: string; quantity: number; amount: number }> }
  ) {
    const order = await this.findById(organizationId, orderId);

    const refund = await this.prisma.refund.create({
      data: {
        organizationId,
        orderId,
        amount: refundData.amount,
        reason: refundData.reason,
        status: 'pending',
        items: {
          create: refundData.items,
        },
      },
      include: {
        items: true,
      },
    });

    // Queue refund notification email asynchronously
    this.storeJobs.queueRefundNotification(refund.id).catch((error) => {
      console.error(`Failed to queue refund notification for ${refund.id}:`, error);
    });

    return refund;
  }

  async getOrderStats(organizationId: string) {
    const [totalOrders, revenueData, statusBreakdown] = await Promise.all([
      this.prisma.order.count({
        where: { organizationId },
      }),
      this.prisma.order.aggregate({
        where: { organizationId },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: revenueData._sum.total || 0,
      statusBreakdown,
    };
  }

  private async generateOrderNumber(organizationId: string): Promise<string> {
    const count = await this.prisma.order.count({
      where: { organizationId },
    });

    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${timestamp}-${(count + 1).toString().padStart(6, '0')}`;
  }
}
