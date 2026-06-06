import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { StorageConfigController } from './storage-config.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController, StorageConfigController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
