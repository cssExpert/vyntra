import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemPageSettingsController } from './system-page-settings.controller';
import { SystemPageSettingsService } from './system-page-settings.service';

@Module({
  imports: [PrismaModule],
  controllers: [SystemPageSettingsController],
  providers: [SystemPageSettingsService],
})
export class SystemPageSettingsModule {}
