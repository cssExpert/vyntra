import { Module } from '@nestjs/common';
import { AdminSettingsController } from '../admin/admin-settings.controller';
import { AdminSettingsService } from '../admin/admin-settings.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  controllers: [OrganizationsController, AdminSettingsController],
  providers: [OrganizationsService, AdminSettingsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
