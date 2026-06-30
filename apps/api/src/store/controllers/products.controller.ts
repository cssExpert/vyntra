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
    @Query('status') status?: string
  ) {
    return this.productsService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
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
}
