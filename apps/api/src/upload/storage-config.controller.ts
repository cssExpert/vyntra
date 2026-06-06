import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Public endpoint for storage configuration
 * Used by frontend storage service to know which provider to use
 * No auth required - settings are not sensitive (credentials are encrypted in DB)
 */
@Controller('upload')
export class StorageConfigController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('config')
  async getStorageConfig() {
    try {
      // For now, always return local storage since the database schema
      // doesn't have storageProvider field yet
      // This will be updated once the Prisma schema is migrated
      return {
        provider: 'local',
        storageProvider: 'local',
      };
    } catch (error) {
      console.error('Failed to fetch storage config:', error);
      // Fallback to local storage
      return {
        provider: 'local',
        storageProvider: 'local',
      };
    }
  }
}
