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
import { InventoryService } from '../services/inventory.service';
import { UpdateInventoryDto } from '../dto';

@Controller('api/store/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('initialize/:productId')
  async initialize(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Body('stock') stock?: number,
    @Body('warehouseLocation') warehouseLocation?: string
  ) {
    return this.inventoryService.initializeProductInventory(
      organizationId,
      productId,
      stock || 0,
      warehouseLocation
    );
  }

  @Get()
  async findAll(
    @CurrentOrg() organizationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string
  ) {
    return this.inventoryService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
    });
  }

  @Get('product/:productId')
  async findByProductId(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string
  ) {
    return this.inventoryService.findByProductId(organizationId, productId, variantId);
  }

  @Put('product/:productId')
  async updateStock(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Query('variantId') variantId?: string
  ) {
    return this.inventoryService.updateStock(
      organizationId,
      productId,
      updateInventoryDto,
      variantId
    );
  }

  @Post('product/:productId/adjust')
  async adjustStock(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('reason') reason: string,
    @Body('notes') notes?: string,
    @Query('variantId') variantId?: string
  ) {
    if (!quantity || !reason) {
      throw new BadRequestException('Quantity and reason are required');
    }

    return this.inventoryService.adjustStock(
      organizationId,
      productId,
      quantity,
      reason,
      notes,
      variantId
    );
  }

  @Post('product/:productId/decrement')
  async decrementStock(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Query('variantId') variantId?: string
  ) {
    if (!quantity || quantity <= 0) {
      throw new BadRequestException('Valid quantity is required');
    }

    return this.inventoryService.decrementStock(
      organizationId,
      productId,
      quantity,
      variantId
    );
  }

  @Post('product/:productId/increment')
  async incrementStock(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('reason') reason?: string,
    @Query('variantId') variantId?: string
  ) {
    if (!quantity || quantity <= 0) {
      throw new BadRequestException('Valid quantity is required');
    }

    return this.inventoryService.incrementStock(
      organizationId,
      productId,
      quantity,
      reason,
      variantId
    );
  }

  @Get('product/:productId/history')
  async getHistory(
    @CurrentOrg() organizationId: string,
    @Param('productId') productId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.inventoryService.getInventoryHistory(organizationId, productId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
    });
  }

  @Get('low-stock')
  async getLowStockItems(
    @CurrentOrg() organizationId: string,
    @Query('threshold') threshold?: string
  ) {
    return this.inventoryService.getLowStockItems(
      organizationId,
      threshold ? parseInt(threshold) : undefined
    );
  }

  @Get('out-of-stock')
  async getOutOfStockItems(@CurrentOrg() organizationId: string) {
    return this.inventoryService.getOutOfStockItems(organizationId);
  }

  @Get('value')
  async getInventoryValue(@CurrentOrg() organizationId: string) {
    return this.inventoryService.getInventoryValue(organizationId);
  }
}
