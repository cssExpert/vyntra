import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TagsModule } from '../tags/tags.module';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';

@Module({
  imports: [PrismaModule, TagsModule],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
