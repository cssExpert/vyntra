import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrdersService } from '../../services/orders.service';
import { UpdateCustomerProfileDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, ChangeCustomerPasswordDto } from '../dto';
import { RequestCustomer } from '../decorators/current-customer.decorator';

@Injectable()
export class StorefrontAccountService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private config: ConfigService,
  ) {}

  async getProfile(customer: RequestCustomer) {
    const record = await this.prisma.storeCustomer.findUnique({ where: { id: customer.id } });
    if (!record) throw new NotFoundException('Customer not found');
    const wishlistCount = await this.prisma.wishlistItem.count({ where: { customerId: customer.id } });
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      rewardPoints: record.rewardPoints,
      storeCredit: record.storeCredit,
      rewardTier: record.rewardTier,
      totalOrders: record.totalOrders,
      totalSpent: record.totalSpent,
      lastLoginAt: record.lastLoginAt,
      wishlistCount,
    };
  }

  /** Mirrors UsersService.changeOwnPassword's shape (apps/api/src/users/users.service.ts) for the customer JWT track. */
  async changePassword(customer: RequestCustomer, dto: ChangeCustomerPasswordDto) {
    const record = await this.prisma.storeCustomer.findUnique({ where: { id: customer.id } });
    if (!record?.passwordHash) {
      throw new BadRequestException('No password is set for this account');
    }
    const ok = await bcrypt.compare(dto.currentPassword, record.passwordHash);
    if (!ok) throw new BadRequestException('Current password is incorrect');
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
    await this.prisma.storeCustomer.update({
      where: { id: customer.id },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, rounds) },
    });
    return { success: true };
  }

  async listCreditTransactions(customer: RequestCustomer, { skip = 0, take = 20 }: { skip?: number; take?: number } = {}) {
    const [data, total] = await Promise.all([
      this.prisma.storeCreditTransaction.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.storeCreditTransaction.count({ where: { customerId: customer.id } }),
    ]);
    return { data, total, skip, take };
  }

  async listRewardTransactions(customer: RequestCustomer, { skip = 0, take = 20 }: { skip?: number; take?: number } = {}) {
    const [data, total] = await Promise.all([
      this.prisma.rewardPointTransaction.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.rewardPointTransaction.count({ where: { customerId: customer.id } }),
    ]);
    return { data, total, skip, take };
  }

  /** No file/license/download-token system exists yet — this is an honest "here's what you bought" list, not a real secure download. */
  async listDownloadableOrders(customer: RequestCustomer) {
    const { data } = await this.ordersService.findAll(customer.organizationId, { skip: 0, take: 100, customerId: customer.id });
    return data
      .map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        items: order.items.filter((item: any) => item.product?.type === 'digital' || item.product?.type === 'downloadable'),
      }))
      .filter((order) => order.items.length > 0);
  }

  async listWishlist(customer: RequestCustomer) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, slug: true, price: true, compareAtPrice: true, featuredImage: true, stockStatus: true } } },
    });
    return items.map((i) => ({ id: i.id, createdAt: i.createdAt, product: i.product }));
  }

  async addWishlistItem(customer: RequestCustomer, productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, organizationId: customer.organizationId } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId: customer.id, productId } },
      update: {},
      create: { customerId: customer.id, productId },
    });
    return this.listWishlist(customer);
  }

  async removeWishlistItem(customer: RequestCustomer, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { customerId: customer.id, productId } });
    return this.listWishlist(customer);
  }

  async updateProfile(customer: RequestCustomer, dto: UpdateCustomerProfileDto) {
    return this.prisma.storeCustomer.update({
      where: { id: customer.id },
      data: { ...(dto.name && { name: dto.name }), ...(dto.phone !== undefined && { phone: dto.phone }) },
    });
  }

  async listOrders(customer: RequestCustomer, { skip = 0, take = 10 }: { skip?: number; take?: number } = {}) {
    return this.ordersService.findAll(customer.organizationId, { skip, take, customerId: customer.id });
  }

  async getOrder(customer: RequestCustomer, orderId: string) {
    const order = await this.ordersService.findById(customer.organizationId, orderId);
    if (order.customerId !== customer.id) {
      throw new ForbiddenException('This order does not belong to you');
    }
    return order;
  }

  async listAddresses(customer: RequestCustomer) {
    return this.prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAddress(customer: RequestCustomer, dto: CreateCustomerAddressDto) {
    if (dto.isDefaultShipping || dto.isDefaultBilling) {
      await this.clearDefaults(customer.id, dto.isDefaultShipping, dto.isDefaultBilling);
    }
    return this.prisma.customerAddress.create({ data: { ...dto, customerId: customer.id } });
  }

  async updateAddress(customer: RequestCustomer, addressId: string, dto: UpdateCustomerAddressDto) {
    await this.assertOwnsAddress(customer.id, addressId);
    if (dto.isDefaultShipping || dto.isDefaultBilling) {
      await this.clearDefaults(customer.id, dto.isDefaultShipping, dto.isDefaultBilling);
    }
    return this.prisma.customerAddress.update({ where: { id: addressId }, data: dto });
  }

  async deleteAddress(customer: RequestCustomer, addressId: string) {
    await this.assertOwnsAddress(customer.id, addressId);
    await this.prisma.customerAddress.delete({ where: { id: addressId } });
    return { success: true };
  }

  private async assertOwnsAddress(customerId: string, addressId: string) {
    const address = await this.prisma.customerAddress.findUnique({ where: { id: addressId } });
    if (!address || address.customerId !== customerId) {
      throw new NotFoundException('Address not found');
    }
  }

  private async clearDefaults(customerId: string, shipping?: boolean, billing?: boolean) {
    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: {
        ...(shipping && { isDefaultShipping: false }),
        ...(billing && { isDefaultBilling: false }),
      },
    });
  }
}
