import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { ModulesService } from './modules.service';

/** Platform module catalog. Read by any authenticated user; managed by super admin. */
@Controller('admin/modules')
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @SuperAdminOnly()
  @Post()
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @SuperAdminOnly()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @SuperAdminOnly()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
