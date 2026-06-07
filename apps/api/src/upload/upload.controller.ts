import {
  Controller,
  Post,
  Delete,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
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
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Get current storage configuration
   * Used by frontend to determine which storage provider to use for uploads
   */
  @Public()
  @Get('config')
  async getConfig() {
    return {
      storageProvider: process.env.STORAGE_PROVIDER || 'local',
      s3Config: process.env.STORAGE_PROVIDER === 's3' ? {
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
      } : null,
      message: 'Current storage configuration',
    };
  }

  /**
   * Upload file to local filesystem with multi-tenant directory structure
   * Directory format: public/uploads/{companyId}/{module}/{filename}
   */
  @Public()
  @Post('local')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLocal(
    @UploadedFile() file: MulterFile,
    @Body() body: {
      filename?: string;
      companyId: string;
      module: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!body.companyId || !body.module) {
      throw new BadRequestException(
        'companyId and module are required in request body',
      );
    }

    try {
      const result = await this.uploadService.uploadLocal(
        file,
        body.filename,
        body.companyId,
        body.module,
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Upload failed',
      );
    }
  }

  /**
   * Get presigned URL for S3 upload
   */
  @Public()
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
  @Public()
  @Post('uploadthing')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToUploadthing(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.uploadService.uploadToUploadthing(file);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Uploadthing upload failed',
      );
    }
  }

  /**
   * Upload file to Vercel Blob
   */
  @Public()
  @Post('vercel-blob')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToVercelBlob(
    @UploadedFile() file: MulterFile,
    @Body('filename') customFilename?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.uploadService.uploadToVercelBlob(
        file,
        customFilename,
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Vercel Blob upload failed',
      );
    }
  }

  /**
   * Delete file from storage
   */
  @Public()
  @Delete('delete')
  async deleteFile(
    @Body() body: { url: string; provider: string },
  ) {
    try {
      await this.uploadService.deleteFile(body.url, body.provider);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Delete failed',
      );
    }
  }

}
