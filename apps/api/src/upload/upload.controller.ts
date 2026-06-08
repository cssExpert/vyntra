import {
  Controller,
  Post,
  Delete,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Req,
  Param,
  Res,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { Public } from '../common/decorators/public.decorator';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from './upload.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get current storage configuration from database
   * Used by frontend to determine which storage provider to use for uploads
   */
  @Public()
  @Get('config')
  async getConfig() {
    try {
      const settings = await this.prisma.adminSettings.findFirst();
      const provider = settings?.storageProvider || 'local';

      return {
        storageProvider: provider,
        s3Config: provider === 's3' && settings?.s3Config
          ? settings.s3Config
          : null,
        uploadthingConfig: provider === 'uploadthing' && settings?.uploadthingConfig
          ? { hasKey: !!settings.uploadthingConfig }
          : null,
        vercelBlobConfig: provider === 'vercel-blob' && settings?.vercelBlobConfig
          ? { hasToken: !!settings.vercelBlobConfig }
          : null,
        message: `Using ${provider} storage provider`,
      };
    } catch (error) {
      // Fallback to local if there's any error reading config
      return {
        storageProvider: 'local',
        message: 'Using local storage (default)',
      };
    }
  }

  /**
   * Upload file to local filesystem with multi-tenant directory structure
   * Directory format: public/uploads/{companyId}/{module}/{filename}
   */
  @Post('local')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLocal(
    @UploadedFile() file: MulterFile,
    @Body() body: { filename?: string; companyId: string; module: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!body.companyId || !body.module)
      throw new BadRequestException('companyId and module are required in request body');

    this.assertCompanyAccess(user, body.companyId);

    try {
      return await this.uploadService.uploadLocal(file, body.filename, body.companyId, body.module);
    } catch (error) {
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  /**
   * Get presigned URL for S3 upload
   */
  @Post('s3/presigned-url')
  async getS3PresignedUrl(
    @Body()
    body: {
      filename: string;
      contentType: string;
      contentLength: number;
    },
  ) {
    try {
      const result = await this.uploadService.getS3PresignedUrl(
        body.filename,
        body.contentType,
        body.contentLength,
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to generate presigned URL',
      );
    }
  }

  /**
   * Upload file to Uploadthing
   */
  @Post('uploadthing')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToUploadthing(
    @UploadedFile() file: MulterFile,
    @Body() body: { companyId: string; module: string; filename?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!body.companyId || !body.module)
      throw new BadRequestException('companyId and module are required in request body');

    this.assertCompanyAccess(user, body.companyId);

    try {
      return await this.uploadService.uploadToUploadthing(file, body.companyId, body.module, body.filename);
    } catch (error) {
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'Uploadthing upload failed');
    }
  }

  /**
   * Upload file to Vercel Blob
   */
  @Post('vercel-blob')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToVercelBlob(
    @UploadedFile() file: MulterFile,
    @Body() body: { companyId: string; module: string; filename?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!body.companyId || !body.module)
      throw new BadRequestException('companyId and module are required in request body');

    this.assertCompanyAccess(user, body.companyId);

    try {
      return await this.uploadService.uploadToVercelBlob(file, body.companyId, body.module, body.filename);
    } catch (error) {
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'Vercel Blob upload failed');
    }
  }

  /**
   * Unified upload endpoint that routes to the configured storage provider.
   * If a cloud provider is configured and the upload fails, the error is
   * surfaced to the caller (no silent local fallback) so misconfiguration
   * is visible instead of files quietly landing on the local disk.
   */
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body() body: { companyId: string; module: string; filename?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!body.companyId || !body.module)
      throw new BadRequestException('companyId and module are required in request body');

    this.assertCompanyAccess(user, body.companyId);

    // Get the configured storage provider from the database
    const settings = await this.prisma.adminSettings.findFirst();
    const provider = settings?.storageProvider || 'local';

    try {
      switch (provider) {
        case 's3':
          return await this.uploadService.uploadToS3(
            file,
            body.companyId,
            body.module,
            body.filename,
          );

        case 'uploadthing':
          return await this.uploadService.uploadToUploadthing(
            file,
            body.companyId,
            body.module,
            body.filename,
          );

        case 'vercel-blob':
          return await this.uploadService.uploadToVercelBlob(
            file,
            body.companyId,
            body.module,
            body.filename,
          );

        case 'local':
        default:
          return await this.uploadService.uploadLocal(
            file,
            body.filename,
            body.companyId,
            body.module,
          );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new InternalServerErrorException(
        `Upload to ${provider} failed: ${message}`,
      );
    }
  }

  /**
   * Migrate all locally-stored images to the active cloud provider.
   * Super-admin only — it mutates DB references.
   */
  @SuperAdminOnly()
  @Post('migrate')
  async migrateToCloud() {
    try {
      return await this.uploadService.migrateLocalToCloud();
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Migration failed',
      );
    }
  }

  /**
   * Delete file from storage
   */
  @Delete('delete')
  async deleteFile(
    @Body() body: { url: string; provider: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Parse companyId from the URL path (/uploads/{companyId}/...) and enforce ownership.
    const match = body.url.match(/\/uploads\/([^/]+)\//);
    if (match) {
      this.assertCompanyAccess(user, match[1]);
    }

    try {
      await this.uploadService.deleteFile(body.url, body.provider);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'Delete failed');
    }
  }

  /**
   * Validate that the requesting user may access the given companyId folder.
   * Super admins can access any folder. Regular users are restricted to their own org.
   */
  private assertCompanyAccess(user: AuthenticatedUser, companyId: string): void {
    if (user.superAdmin) return;

    const normalized = companyId === 'admin' ? 'superadmin' : companyId;
    if (normalized === 'superadmin') {
      throw new ForbiddenException('Only super admins can upload to the superadmin folder');
    }
    if (user.organizationId !== companyId) {
      throw new ForbiddenException('You can only upload files for your own organization');
    }
  }

}
