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
import { CustomersService } from '../services/customers.service';
import { CreateStoreCustomerDto, UpdateStoreCustomerDto } from '../dto';

@Controller('store/customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  async create(
    @CurrentOrg() organizationId: string,
    @Body() createCustomerDto: CreateStoreCustomerDto
  ) {
    return this.customersService.create(organizationId, createCustomerDto);
  }

  @Get()
  async findAll(
    @CurrentOrg() organizationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('segment') segment?: string,
    @Query('isVip') isVip?: string
  ) {
    return this.customersService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
      segment,
      isVip: isVip === 'true',
    });
  }

  @Get('stats')
  async getStats(@CurrentOrg() organizationId: string) {
    return this.customersService.getCustomerStats(organizationId);
  }

  @Get('email/:email')
  async findByEmail(
    @CurrentOrg() organizationId: string,
    @Param('email') email: string
  ) {
    return this.customersService.findByEmail(organizationId, email);
  }

  @Get(':id')
  async findById(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.customersService.findById(organizationId, id);
  }

  @Put(':id')
  async update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateStoreCustomerDto
  ) {
    return this.customersService.update(organizationId, id, updateCustomerDto);
  }

  @Delete(':id')
  async delete(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.customersService.delete(organizationId, id);
  }

  @Post(':id/credit')
  async addStoreCredit(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string
  ) {
    if (!amount || amount <= 0 || !reason) {
      throw new BadRequestException('Amount and reason are required');
    }

    return this.customersService.addStoreCredit(organizationId, id, amount, reason);
  }

  @Post(':id/credit/deduct')
  async deductStoreCredit(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string
  ) {
    if (!amount || amount <= 0 || !reason) {
      throw new BadRequestException('Amount and reason are required');
    }

    return this.customersService.deductStoreCredit(organizationId, id, amount, reason);
  }

  @Post(':id/reward-points')
  async addRewardPoints(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('points') points: number,
    @Body('reason') reason: string
  ) {
    if (!points || points <= 0 || !reason) {
      throw new BadRequestException('Points and reason are required');
    }

    return this.customersService.addRewardPoints(organizationId, id, points, reason);
  }

  @Post(':id/sync-metrics')
  async syncMetrics(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.customersService.syncCustomerMetrics(organizationId, id);
  }
}
