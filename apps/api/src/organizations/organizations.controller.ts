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
  OrganizationSettingsDto,
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

  // ── Activity / audit log (any authenticated member) ──
  @Get('organizations/activity')
  getActivity(@CurrentOrg() organizationId: string | null) {
    return this.organizationsService.getActivity(organizationId);
  }

  // ── Organization Settings ──
  @Get('organizations/settings')
  getSettings(@CurrentOrg() organizationId: string | null) {
    return this.organizationsService.getSettings(organizationId);
  }

  @Put('organizations/settings')
  updateSettings(
    @CurrentOrg() organizationId: string | null,
    @Body() dto: OrganizationSettingsDto,
  ) {
    return this.organizationsService.updateSettings(organizationId, dto);
  }

  // ── Super admin: company management ──
  @SuperAdminOnly()
  @Get('admin/companies')
  findAll() {
    return this.organizationsService.findAll();
  }

  @SuperAdminOnly()
  @Get('admin/companies/:id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @SuperAdminOnly()
  @Post('admin/companies')
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @SuperAdminOnly()
  @Patch('admin/companies/:id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @SuperAdminOnly()
  @Delete('admin/companies/:id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @SuperAdminOnly()
  @Put('admin/companies/:id/package')
  assignPackage(@Param('id') id: string, @Body() dto: AssignPackageDto) {
    return this.organizationsService.assignPackage(id, dto.packageSlug);
  }
}
