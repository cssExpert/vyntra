import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CouponsService } from '../services/coupons.service';
import { CreateCouponCodeDto, UpdateCouponCodeDto } from '../dto';

@Controller('store/coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post()
  async create(
    @CurrentOrg() organizationId: string,
    @Body() createCouponDto: CreateCouponCodeDto
  ) {
    return this.couponsService.create(organizationId, createCouponDto);
  }

  @Get()
  async findAll(
    @CurrentOrg() organizationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string
  ) {
    return this.couponsService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
    });
  }

  @Get('stats')
  async getStats(@CurrentOrg() organizationId: string) {
    return this.couponsService.getCouponStats(organizationId);
  }

  @Get('code/:code')
  async findByCode(
    @CurrentOrg() organizationId: string,
    @Param('code') code: string
  ) {
    return this.couponsService.findByCode(organizationId, code);
  }

  @Get(':id')
  async findById(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.couponsService.findById(organizationId, id);
  }

  @Post('validate')
  async validateCoupon(
    @CurrentOrg() organizationId: string,
    @Body('code') code: string,
    @Body('cartTotal') cartTotal: number,
    @Body('customerId') customerId?: string
  ) {
    if (!code || !cartTotal || cartTotal <= 0) {
      throw new BadRequestException('Code and valid cart total are required');
    }

    const coupon = await this.couponsService.validateCoupon(
      organizationId,
      code,
      cartTotal,
      customerId
    );

    const discount = await this.couponsService.calculateDiscount(coupon, cartTotal);

    return {
      valid: true,
      coupon,
      discount,
      finalTotal: Math.max(0, cartTotal - discount),
    };
  }

  @Post('apply')
  async applyCoupon(
    @CurrentOrg() organizationId: string,
    @Body('orderId') orderId: string,
    @Body('code') code: string,
    @Body('cartTotal') cartTotal: number,
    @Body('customerId') customerId: string
  ) {
    if (!orderId || !code || !cartTotal || !customerId) {
      throw new BadRequestException('orderId, code, cartTotal, and customerId are required');
    }

    return this.couponsService.applyCoupon(organizationId, orderId, code, cartTotal, customerId);
  }

  @Put(':id')
  async update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponCodeDto
  ) {
    return this.couponsService.update(organizationId, id, updateCouponDto);
  }

  @Post(':id/deactivate')
  async deactivate(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.couponsService.deactivate(organizationId, id);
  }

  @Delete(':id')
  async delete(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.couponsService.delete(organizationId, id);
  }
}
