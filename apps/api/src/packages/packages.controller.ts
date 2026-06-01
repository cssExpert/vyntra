import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { PackagesService } from './packages.service';

@Controller()
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  /** Public plan catalog — used by the future self-signup flow. */
  @Public()
  @Get('packages')
  findPublic() {
    return this.packagesService.findPublic();
  }

  @SuperAdminOnly()
  @Get('admin/packages')
  findAll() {
    return this.packagesService.findAll();
  }

  @SuperAdminOnly()
  @Get('admin/packages/:id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @SuperAdminOnly()
  @Post('admin/packages')
  create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @SuperAdminOnly()
  @Patch('admin/packages/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }

  @SuperAdminOnly()
  @Delete('admin/packages/:id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
