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
      testEmail?: string;
    },
  ) {
    return this.adminSettingsService.testSmtpConnection(config);
  }

  @Public()
  @Post('storage/test')
  async testStorageConnection(
    @Body()
    config: {
      provider: string;
      s3Config?: {
        bucket: string;
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
      };
      uploadthingConfig?: {
        apiKey: string;
      };
      vercelBlobConfig?: {
        token: string;
      };
    },
  ) {
    return this.adminSettingsService.testStorageConnection(config);
  }
}
