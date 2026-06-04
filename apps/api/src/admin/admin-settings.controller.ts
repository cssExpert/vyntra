import { Body, Controller, Get, Put } from '@nestjs/common';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { UpdateAdminSettingsDto } from './dto/admin-settings.dto';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private adminSettingsService: AdminSettingsService) {}

  @Get()
  getSettings() {
    return this.adminSettingsService.getSettings();
  }

  @SuperAdminOnly()
  @Put()
  updateSettings(@Body() dto: UpdateAdminSettingsDto) {
    return this.adminSettingsService.updateSettings(dto);
  }
}
