import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItems: number;
  averageItemsPerOrder: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  averageCustomerValue: number;
  vipCount: number;
  atRiskCustomers: number; // No orders in 90 days
}

interface ProductPerformance {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  trend: 'trending_up' | 'stable' | 'trending_down';
}

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalProducts: number;
  totalSold: number;
  totalRevenue: number;
  percentOfTotal: number;
}

interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  turnoverRate: number; // Average inventory turnover per month
}

interface ConversionFunnel {
  totalVisits: number; // TODO: Integrate with analytics provider
  productsViewed: number;
  cartsCreated: number;
  ordersCompleted: number;
  conversionRate: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive sales metrics
   */
  async getSalesMetrics(
    organizationId: string,
    dateRange?: { from: Date; to: Date },
  ): Promise<SalesMetrics> {
    const where = {
      organizationId,
      status: 'delivered',
      ...(dateRange && { createdAt: { gte: dateRange.from, lte: dateRange.to } }),
    };

    const [totalOrders, totalRevenue, itemStats] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.orderItem.aggregate({
        where: { order: { organizationId } },
        _sum: { quantity: true },
        _count: true,
      }),
    ]);

    const revenue = totalRevenue._sum.total || 0;

    return {
      totalRevenue: revenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
      totalItems: itemStats._sum.quantity || 0,
      averageItemsPerOrder: totalOrders > 0 ? (itemStats._sum.quantity || 0) / totalOrders : 0,
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerMetrics(organizationId: string): Promise<CustomerMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      newCustomers,
      vipCount,
      customerSpending,
      atRisk,
    ] = await Promise.all([
      this.prisma.storeCustomer.count({ where: { organizationId } }),
      this.prisma.storeCustomer.count({
        where: { organizationId, registeredAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.storeCustomer.count({
        where: { organizationId, isVip: true },
      }),
      this.prisma.storeCustomer.aggregate({
        where: { organizationId },
        _avg: { totalSpent: true },
      }),
      this.prisma.storeCustomer.count({
        where: {
          organizationId,
          lastOrderDate: { lt: ninetyDaysAgo },
        },
      }),
    ]);

    return {
      totalCustomers,
      newCustomersThisMonth: newCustomers,
      returningCustomers: totalCustomers - newCustomers,
      averageCustomerValue: customerSpending._avg.totalSpent || 0,
      vipCount,
      atRiskCustomers: atRisk,
    };
  }

  /**
   * Get top performing products
   */
  async getTopProducts(
    organizationId: string,
    limit: number = 10,
  ): Promise<ProductPerformance[]> {
    const products = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { organizationId },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const result: ProductPerformance[] = [];

    for (const item of products) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          reviews: true,
        },
      });

      if (!product) continue;

      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      result.push({
        productId: product.id,
        productName: product.name,
        totalSold: item._sum.quantity || 0,
        totalRevenue: item._sum.totalPrice || 0,
        averageRating: avgRating,
        reviewCount: product.reviews.length,
        trend: 'stable', // TODO: Calculate trend from historical data
      });
    }

    return result;
  }

  /**
   * Get category performance breakdown
   */
  async getCategoryPerformance(
    organizationId: string,
  ): Promise<CategoryPerformance[]> {
    const categories = await this.prisma.productCategory.findMany({
      where: { organizationId },
      include: {
        children: true,
      },
    });

    const totalRevenue = await this.prisma.order.aggregate({
      where: { organizationId, status: 'delivered' },
      _sum: { total: true },
    });

    const total = totalRevenue._sum.total || 1; // Avoid division by zero

    const result: CategoryPerformance[] = [];

    for (const category of categories) {
      const sales = await this.prisma.orderItem.aggregate({
        where: {
          product: {
            categoryIds: {
              has: category.id,
            },
          },
        },
        _sum: {
          quantity: true,
          totalPrice: true,
        },
      });

      result.push({
        categoryId: category.id,
        categoryName: category.name,
        totalProducts: (
          await this.prisma.product.count({
            where: {
              organizationId,
              categoryIds: { has: category.id },
            },
          })
        ),
        totalSold: sales._sum.quantity || 0,
        totalRevenue: sales._sum.totalPrice || 0,
        percentOfTotal: ((sales._sum.totalPrice || 0) / total) * 100,
      });
    }

    return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Get inventory health metrics
   */
  async getInventoryMetrics(organizationId: string): Promise<InventoryMetrics> {
    const [totalInventory, lowStock, outOfStock] = await Promise.all([
      this.prisma.inventory.aggregate({
        where: { organizationId },
        _sum: { stock: true },
      }),
      this.prisma.inventory.count({
        where: {
          organizationId,
          stock: { gt: 0, lte: 10 },
        },
      }),
      this.prisma.inventory.count({
        where: { organizationId, stock: 0 },
      }),
    ]);

    // Calculate inventory value
    const inventory = await this.prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const totalValue = inventory.reduce((sum, inv) => {
      return sum + inv.stock * (inv.product.costPrice || 0);
    }, 0);

    return {
      totalItems: totalInventory._sum.stock || 0,
      totalValue,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      turnoverRate: 0, // TODO: Calculate from historical inventory movements
    };
  }

  /**
   * Get conversion funnel metrics
   * This is a simplified version - integrate with actual analytics provider
   */
  async getConversionFunnel(organizationId: string): Promise<ConversionFunnel> {
    const ordersCompleted = await this.prisma.order.count({
      where: { organizationId, status: 'delivered' },
    });

    // These would come from your analytics provider or tracking service
    // For now, we'll derive them from order data
    const totalOrders = await this.prisma.order.count({
      where: { organizationId },
    });

    return {
      totalVisits: 0, // TODO: Integrate with analytics
      productsViewed: 0, // TODO: Integrate with analytics
      cartsCreated: 0, // TODO: Integrate with analytics
      ordersCompleted,
      conversionRate: totalOrders > 0 ? (ordersCompleted / totalOrders) * 100 : 0,
    };
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(
    organizationId: string,
    days: number = 30,
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      orderCount: number;
    }>
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        organizationId,
        status: 'delivered',
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by date
    const groupedByDate: Record<
      string,
      { revenue: number; orderCount: number }
    > = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { revenue: 0, orderCount: 0 };
      }
      groupedByDate[dateKey].revenue += order.total;
      groupedByDate[dateKey].orderCount += 1;
    });

    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orderCount: data.orderCount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get customer segmentation
   */
  async getCustomerSegmentation(
    organizationId: string,
  ): Promise<{
    highValue: number;
    midValue: number;
    lowValue: number;
    inactive: number;
  }> {
    const customers = await this.prisma.storeCustomer.findMany({
      where: { organizationId },
      select: { totalSpent: true, lastOrderDate: true },
    });

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const avgSpend =
      customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length ||
      0;

    const segments = {
      highValue: 0,
      midValue: 0,
      lowValue: 0,
      inactive: 0,
    };

    customers.forEach((customer) => {
      if (!customer.lastOrderDate || customer.lastOrderDate < ninetyDaysAgo) {
        segments.inactive += 1;
      } else if (customer.totalSpent > avgSpend * 1.5) {
        segments.highValue += 1;
      } else if (customer.totalSpent > avgSpend * 0.5) {
        segments.midValue += 1;
      } else {
        segments.lowValue += 1;
      }
    });

    return segments;
  }
}
