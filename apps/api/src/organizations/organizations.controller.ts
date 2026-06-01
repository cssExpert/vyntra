import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import {
  AssignPackageDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  // ── Current org (any authenticated member) ──
  @Get('organizations/me')
  getMyOrg(@CurrentOrg() organizationId: string | null) {
    return this.organizationsService.getCurrentOrg(organizationId);
  }

  // ── Super admin management ──
  @SuperAdminOnly()
  @Get('admin/organizations')
  findAll() {
    return this.organizationsService.findAll();
  }

  @SuperAdminOnly()
  @Get('admin/organizations/:id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @SuperAdminOnly()
  @Post('admin/organizations')
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @SuperAdminOnly()
  @Patch('admin/organizations/:id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @SuperAdminOnly()
  @Delete('admin/organizations/:id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @SuperAdminOnly()
  @Put('admin/organizations/:id/package')
  assignPackage(@Param('id') id: string, @Body() dto: AssignPackageDto) {
    return this.organizationsService.assignPackage(id, dto.packageSlug);
  }
}
