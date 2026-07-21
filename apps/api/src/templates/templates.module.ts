import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBlocksController } from './admin-blocks.controller';
import { AdminTemplatesController } from './admin-templates.controller';
import { TemplatesController } from './templates.controller';
import { BlocksService } from './blocks.service';
import { TemplatesService } from './templates.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminBlocksController, AdminTemplatesController, TemplatesController],
  providers: [BlocksService, TemplatesService],
  exports: [BlocksService, TemplatesService],
})
export class TemplatesModule {}
