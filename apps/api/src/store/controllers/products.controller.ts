import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dto';

@Controller('store/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async create(
    @CurrentOrg() organizationId: string,
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.create(organizationId, createProductDto);
  }

  @Get()
  async findAll(
    @CurrentOrg() organizationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string
  ) {
    return this.productsService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
      categoryId,
      type,
    });
  }

  @Get('slug/:slug')
  async findBySlug(
    @CurrentOrg() organizationId: string,
    @Param('slug') slug: string
  ) {
    return this.productsService.findBySlug(organizationId, slug);
  }

  @Get(':id')
  async findById(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.productsService.findById(organizationId, id);
  }

  @Put(':id')
  async update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(organizationId, id, updateProductDto);
  }

  @Delete(':id')
  async delete(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.productsService.delete(organizationId, id);
  }

  @Put(':id/stock')
  async updateStock(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('quantity') quantity: number
  ) {
    if (typeof quantity !== 'number' || quantity < 0) {
      throw new BadRequestException('Quantity must be a non-negative number');
    }

    return this.productsService.updateStock(organizationId, id, quantity);
  }

  // ─── Product Media ──────────────────────────────────────────────────────────

  @Post(':id/media')
  async addMedia(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() dto: { url: string; type?: string; alt?: string; isPrimary?: boolean; sortOrder?: number },
  ) {
    return this.productsService.addMedia(organizationId, id, dto);
  }

  @Delete(':id/media/:mediaId')
  async removeMedia(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.productsService.removeMedia(organizationId, id, mediaId);
  }

  @Patch(':id/media/:mediaId/primary')
  async setPrimaryMedia(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.productsService.setPrimaryMedia(organizationId, id, mediaId);
  }

  @Put(':id/media/reorder')
  async reorderMedia(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body('orderedIds') orderedIds: string[],
  ) {
    return this.productsService.reorderMedia(organizationId, id, orderedIds);
  }
}
