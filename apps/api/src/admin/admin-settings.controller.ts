import { Body, Controller, Get, Put, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { UpdateAdminSettingsDto } from './dto/admin-settings.dto';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private adminSettingsService: AdminSettingsService) {}

  @Public()
  @Get()
  getSettings() {
    return this.adminSettingsService.getSettings();
  }

  @SuperAdminOnly()
  @Put()
  updateSettings(@Body() dto: UpdateAdminSettingsDto) {
    return this.adminSettingsService.updateSettings(dto);
  }

  @Public()
  @Post('email/test-smtp')
  async testSmtp(
    @Body()
    config: {
      host: string;
      port: number;
      secure?: boolean;
      username?: string;
      password?: string;
      fromEmail: string;
    },
  ) {
    return this.adminSettingsService.testSmtpConnection(config);
  }
}
