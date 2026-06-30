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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CategoriesService } from '../services/categories.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from '../dto';

@Controller('store/categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  async create(
    @CurrentOrg() organizationId: string,
    @Body() createCategoryDto: CreateProductCategoryDto
  ) {
    return this.categoriesService.create(organizationId, createCategoryDto);
  }

  @Get()
  async findAll(
    @CurrentOrg() organizationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string
  ) {
    return this.categoriesService.findAll(organizationId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
      status,
      parentId,
    });
  }

  @Get('hierarchy')
  async getHierarchy(@CurrentOrg() organizationId: string) {
    return this.categoriesService.getHierarchy(organizationId);
  }

  @Get('slug/:slug')
  async findBySlug(
    @CurrentOrg() organizationId: string,
    @Param('slug') slug: string
  ) {
    return this.categoriesService.findBySlug(organizationId, slug);
  }

  @Get(':id')
  async findById(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.categoriesService.findById(organizationId, id);
  }

  @Put(':id')
  async update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateProductCategoryDto
  ) {
    return this.categoriesService.update(organizationId, id, updateCategoryDto);
  }

  @Delete(':id')
  async delete(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string
  ) {
    return this.categoriesService.delete(organizationId, id);
  }
}
