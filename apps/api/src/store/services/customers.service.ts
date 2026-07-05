import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreCustomerDto, UpdateStoreCustomerDto } from '../dto';
import { StoreJobsService } from './store-jobs.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private storeJobs: StoreJobsService,
  ) {}

  async create(organizationId: string, createCustomerDto: CreateStoreCustomerDto) {
    // Check for duplicate email
    const existing = await this.prisma.storeCustomer.findFirst({
      where: {
        organizationId,
        email: createCustomerDto.email,
      },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    return this.prisma.storeCustomer.create({
      data: {
        organizationId,
        ...createCustomerDto,
      },
    });
  }

  async findAll(
    organizationId: string,
    {
      skip = 0,
      take = 10,
      status,
      segment,
      isVip,
    }: { skip?: number; take?: number; status?: string; segment?: string; isVip?: boolean } = {}
  ) {
    const where = {
      organizationId,
      ...(status && { status }),
      ...(segment && { segment }),
      ...(isVip !== undefined && { isVip }),
    };

    const [data, total] = await Promise.all([
      this.prisma.storeCustomer.findMany({
        where,
        skip,
        take,
        include: {
          orders: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { registeredAt: 'desc' },
      }),
      this.prisma.storeCustomer.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findById(organizationId: string, id: string) {
    const customer = await this.prisma.storeCustomer.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        creditTransactions: { orderBy: { createdAt: 'desc' }, take: 5 },
        rewardTransactions: { orderBy: { createdAt: 'desc' }, take: 5 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!customer || customer.organizationId !== organizationId) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByEmail(organizationId: string, email: string) {
    const customer = await this.prisma.storeCustomer.findUnique({
      where: {
        organizationId_email: { organizationId, email },
      },
      include: {
        orders: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(
    organizationId: string,
    id: string,
    updateCustomerDto: UpdateStoreCustomerDto
  ) {
    const customer = await this.findById(organizationId, id);

    // Check email uniqueness if changing
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existing = await this.prisma.storeCustomer.findFirst({
        where: {
          organizationId,
          email: updateCustomerDto.email,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    return this.prisma.storeCustomer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async delete(organizationId: string, id: string) {
    const customer = await this.findById(organizationId, id);

    // Check if customer has orders
    const orderCount = await this.prisma.order.count({
      where: { customerId: id },
    });

    if (orderCount > 0) {
      throw new BadRequestException('Cannot delete customer with existing orders');
    }

    return this.prisma.storeCustomer.delete({
      where: { id },
    });
  }

  async addStoreCredit(
    organizationId: string,
    customerId: string,
    amount: number,
    reason: string
  ) {
    const customer = await this.findById(organizationId, customerId);

    await this.prisma.storeCustomer.update({
      where: { id: customerId },
      data: {
        storeCredit: {
          increment: amount,
        },
      },
    });

    const transaction = await this.prisma.storeCreditTransaction.create({
      data: {
        organizationId,
        customerId,
        amount,
        type: 'credit',
        reason,
      },
    });

    // Queue credit alert email asynchronously (fire-and-forget)
    this.storeJobs.queueCreditAlert(customerId).catch((error: any) => {
      console.error(`Failed to queue credit alert for ${customerId}:`, error);
    });

    return transaction;
  }

  async deductStoreCredit(
    organizationId: string,
    customerId: string,
    amount: number,
    reason: string
  ) {
    const customer = await this.findById(organizationId, customerId);

    if (customer.storeCredit < amount) {
      throw new BadRequestException('Insufficient store credit');
    }

    await this.prisma.storeCustomer.update({
      where: { id: customerId },
      data: {
        storeCredit: {
          decrement: amount,
        },
      },
    });

    return this.prisma.storeCreditTransaction.create({
      data: {
        organizationId,
        customerId,
        amount,
        type: 'debit',
        reason,
      },
    });
  }

  async addRewardPoints(
    organizationId: string,
    customerId: string,
    points: number,
    reason: string
  ) {
    const customer = await this.findById(organizationId, customerId);

    await this.prisma.storeCustomer.update({
      where: { id: customerId },
      data: {
        rewardPoints: {
          increment: points,
        },
      },
    });

    return this.prisma.rewardPointTransaction.create({
      data: {
        organizationId,
        customerId,
        points,
        type: 'earn',
        reason,
      },
    });
  }

  async getCustomerStats(organizationId: string) {
    const [totalCustomers, vipCustomers, activeThisMonth, totalSpent] = await Promise.all([
      this.prisma.storeCustomer.count({
        where: { organizationId },
      }),
      this.prisma.storeCustomer.count({
        where: { organizationId, isVip: true },
      }),
      this.prisma.storeCustomer.count({
        where: {
          organizationId,
          registeredAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.storeCustomer.aggregate({
        where: { organizationId },
        _sum: { totalSpent: true },
      }),
    ]);

    return {
      totalCustomers,
      vipCustomers,
      activeThisMonth,
      totalSpent: totalSpent._sum.totalSpent || 0,
    };
  }

  async syncCustomerMetrics(organizationId: string, customerId: string) {
    const customer = await this.findById(organizationId, customerId);

    // Calculate order metrics
    const orders = await this.prisma.order.findMany({
      where: { customerId, status: 'delivered' },
      select: { total: true },
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

    return this.prisma.storeCustomer.update({
      where: { id: customerId },
      data: {
        totalOrders: orders.length,
        totalSpent,
        averageOrderValue,
        lastOrderDate: orders.length > 0 ? new Date() : null,
      },
    });
  }
}
