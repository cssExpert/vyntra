import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../dto';

@Controller('store/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async create(
    @CurrentOrg() organizationId: string,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.create(organizationId, createOrderDto);
  }

  @Get()
  async findAll(
    @CurrentOrg() organizationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string
  ) {
    return this.ordersService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
      customerId,
    });
  }

  @Get('stats')
  async getStats(@CurrentOrg() organizationId: string) {
    return this.ordersService.getOrderStats(organizationId);
  }

  @Get('number/:orderNumber')
  async findByOrderNumber(
    @CurrentOrg() organizationId: string,
    @Param('orderNumber') orderNumber: string
  ) {
    return this.ordersService.findByOrderNumber(organizationId, orderNumber);
  }

  @Get(':id')
  async findById(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.ordersService.findById(organizationId, id);
  }

  @Put(':id')
  async update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.ordersService.update(organizationId, id, updateOrderDto);
  }

  @Put(':id/status')
  async updateStatus(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('message') message?: string
  ) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }

    return this.ordersService.updateStatus(organizationId, id, status, message);
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return this.ordersService.cancel(organizationId, id, reason);
  }

  @Post(':id/payment')
  async addPayment(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body()
    paymentData: { amount: number; method: string; transactionId?: string }
  ) {
    if (!paymentData.amount || !paymentData.method) {
      throw new BadRequestException('Amount and method are required');
    }

    return this.ordersService.addPayment(organizationId, id, paymentData);
  }

  @Post(':id/refund')
  async recordRefund(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body()
    refundData: {
      amount: number;
      reason: string;
      items: Array<{ orderItemId: string; quantity: number; amount: number }>;
    }
  ) {
    if (!refundData.amount || !refundData.reason || !refundData.items) {
      throw new BadRequestException('Amount, reason, and items are required');
    }

    return this.ordersService.recordRefund(organizationId, id, refundData);
  }
}
