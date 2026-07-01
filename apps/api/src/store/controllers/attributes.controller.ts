import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { AttributesService } from '../services/attributes.service';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';

@Controller('store/attributes')
@UseGuards(JwtAuthGuard)
export class AttributesController {
  constructor(private attributesService: AttributesService) {}

  @Get()
  findAll(@CurrentOrg() organizationId: string) {
    return this.attributesService.findAll(organizationId);
  }

  @Get(':id')
  findById(@CurrentOrg() organizationId: string, @Param('id') id: string) {
    return this.attributesService.findById(organizationId, id);
  }

  @Post()
  create(@CurrentOrg() organizationId: string, @Body() dto: CreateAttributeDto) {
    return this.attributesService.create(organizationId, dto);
  }

  @Put(':id')
  update(
    @CurrentOrg() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(organizationId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentOrg() organizationId: string, @Param('id') id: string) {
    return this.attributesService.delete(organizationId, id);
  }
}
