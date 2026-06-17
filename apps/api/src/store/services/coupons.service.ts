import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponCodeDto, UpdateCouponCodeDto } from '../dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createCouponDto: CreateCouponCodeDto) {
    const { code, ...rest } = createCouponDto;
    const upperCode = code.toUpperCase();

    // Check for duplicate code
    const existing = await this.prisma.couponCode.findFirst({
      where: {
        organizationId,
        code: upperCode,
      },
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    return this.prisma.couponCode.create({
      data: {
        organizationId,
        code: upperCode,
        ...rest,
      },
    });
  }

  async findAll(
    organizationId: string,
    {
      skip = 0,
      take = 10,
      status,
    }: { skip?: number; take?: number; status?: string } = {}
  ) {
    const where = {
      organizationId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.couponCode.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { usages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.couponCode.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findById(organizationId: string, id: string) {
    const coupon = await this.prisma.couponCode.findUnique({
      where: { id },
      include: {
        usages: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon || coupon.organizationId !== organizationId) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findByCode(organizationId: string, code: string) {
    const coupon = await this.prisma.couponCode.findUnique({
      where: {
        organizationId_code: { organizationId, code: code.toUpperCase() },
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async validateCoupon(
    organizationId: string,
    code: string,
    cartTotal: number,
    customerId?: string
  ) {
    const coupon = await this.findByCode(organizationId, code);

    // Check if active
    if (coupon.status !== 'active') {
      throw new BadRequestException('Coupon is not active');
    }

    // Check dates
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // Check minimum spend
    if (coupon.minimumSpend && cartTotal < coupon.minimumSpend) {
      throw new BadRequestException(
        `Minimum order value of ${coupon.minimumSpend} required`
      );
    }

    // Check per-user usage limit
    if (coupon.usageLimitPerUser && customerId) {
      const userUsageCount = await this.prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          customerId,
        },
      });

      if (userUsageCount >= coupon.usageLimitPerUser) {
        throw new BadRequestException('You have reached the usage limit for this coupon');
      }
    }

    return coupon;
  }

  async calculateDiscount(coupon: any, cartTotal: number): Promise<number> {
    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }

    // Apply maximum discount limit if set
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }

    return discount;
  }

  async applyCoupon(
    organizationId: string,
    orderId: string,
    couponCode: string,
    cartTotal: number,
    customerId: string
  ) {
    const coupon = await this.validateCoupon(organizationId, couponCode, cartTotal, customerId);
    const discount = await this.calculateDiscount(coupon, cartTotal);

    // Record usage
    await this.prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        orderId,
        customerId,
        discountAmount: discount,
      },
    });

    // Increment usage count
    await this.prisma.couponCode.update({
      where: { id: coupon.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return {
      coupon,
      discount,
      finalTotal: Math.max(0, cartTotal - discount),
    };
  }

  async update(
    organizationId: string,
    id: string,
    updateCouponDto: UpdateCouponCodeDto
  ) {
    const coupon = await this.findById(organizationId, id);

    return this.prisma.couponCode.update({
      where: { id },
      data: updateCouponDto,
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });
  }

  async deactivate(organizationId: string, id: string) {
    const coupon = await this.findById(organizationId, id);

    return this.prisma.couponCode.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }

  async delete(organizationId: string, id: string) {
    const coupon = await this.findById(organizationId, id);

    // Check if coupon has been used
    const usageCount = await this.prisma.couponUsage.count({
      where: { couponId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException('Cannot delete coupon that has been used');
    }

    return this.prisma.couponCode.delete({
      where: { id },
    });
  }

  async getCouponStats(organizationId: string) {
    const [totalCoupons, activeCoupons, totalUsages, totalDiscount] = await Promise.all([
      this.prisma.couponCode.count({
        where: { organizationId },
      }),
      this.prisma.couponCode.count({
        where: { organizationId, status: 'active' },
      }),
      this.prisma.couponUsage.count({
        where: {
          coupon: { organizationId },
        },
      }),
      this.prisma.couponUsage.aggregate({
        where: {
          coupon: { organizationId },
        },
        _sum: { discountAmount: true },
      }),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      totalUsages,
      totalDiscount: totalDiscount._sum.discountAmount || 0,
    };
  }
}
