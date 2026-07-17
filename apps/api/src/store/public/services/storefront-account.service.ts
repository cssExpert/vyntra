import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrdersService } from '../../services/orders.service';
import { UpdateCustomerProfileDto, CreateCustomerAddressDto, UpdateCustomerAddressDto } from '../dto';
import { RequestCustomer } from '../decorators/current-customer.decorator';

@Injectable()
export class StorefrontAccountService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  async getProfile(customer: RequestCustomer) {
    const record = await this.prisma.storeCustomer.findUnique({ where: { id: customer.id } });
    if (!record) throw new NotFoundException('Customer not found');
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
    };
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
