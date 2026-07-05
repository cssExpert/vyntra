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
import { CustomerGroupsService } from '../services/customer-groups.service';
import {
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto,
  UpdateCustomerGroupRestrictionsDto,
  UpdateProductTierPricesDto,
} from '../dto';

@Controller('store/customer-groups')
@UseGuards(JwtAuthGuard)
export class CustomerGroupsController {
  constructor(private customerGroupsService: CustomerGroupsService) {}

  @Get()
  async findAll(@CurrentOrg() organizationId: string) {
    return this.customerGroupsService.findAll(organizationId);
  }

  @Get('products/search')
  async searchProducts(
    @CurrentOrg() organizationId: string,
    @Query('q') q?: string,
  ) {
    return this.customerGroupsService.searchProducts(organizationId, q ?? '');
  }

  @Get(':productId/tier-prices')
  async getTierPrices(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
  ) {
    return this.customerGroupsService.getTierPrices(organizationId, productId);
  }

  @Put(':productId/tier-prices')
  async updateTierPrices(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductTierPricesDto,
  ) {
    return this.customerGroupsService.updateTierPrices(organizationId, productId, dto);
  }

  @Post()
  async create(
    @CurrentOrg() organizationId: string,
    @Body() dto: CreateCustomerGroupDto,
  ) {
    return this.customerGroupsService.create(organizationId, dto);
  }

  @Get(':id')
  async findById(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customerGroupsService.findById(organizationId, id);
  }

  @Put(':id')
  async update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerGroupDto,
  ) {
    return this.customerGroupsService.update(organizationId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customerGroupsService.delete(organizationId, id);
  }

  @Get(':id/restrictions')
  async getRestrictions(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customerGroupsService.getRestrictions(organizationId, id);
  }

  @Put(':id/restrictions')
  async updateRestrictions(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerGroupRestrictionsDto,
  ) {
    return this.customerGroupsService.updateRestrictions(organizationId, id, dto);
  }

  @Post(':id/restrictions/preview-pattern')
  async previewPattern(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('pattern') pattern: string,
  ) {
    if (!pattern) {
      throw new BadRequestException('Pattern is required');
    }
    return this.customerGroupsService.previewPattern(organizationId, id, pattern);
  }
}
