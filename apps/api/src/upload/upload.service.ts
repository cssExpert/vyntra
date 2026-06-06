import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Type for multer file (Express doesn't export this type directly)
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

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upload file to local filesystem with multi-tenant directory structure
   * Directory format: public/uploads/{companyId}/{module}/{filename}
   * This ensures data isolation and proper organization for multi-tenant SaaS
   */
  async uploadLocal(
    file: MulterFile,
    customFilename?: string,
    companyId?: string,
    module?: string,
  ): Promise<UploadResult> {
    // Build directory path with company and module
    let uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (companyId && module) {
      // Multi-tenant path: public/uploads/{companyId}/{module}/
      uploadDir = path.join(uploadDir, companyId, module);
    } else if (companyId) {
      // Fallback: public/uploads/{companyId}/
      uploadDir = path.join(uploadDir, companyId);
    }

    // Create upload directory structure if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate filename
    const filename = customFilename || `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Return public URL matching directory structure
    let url = `/uploads/${filename}`;
    if (companyId && module) {
      url = `/uploads/${companyId}/${module}/${filename}`;
    } else if (companyId) {
      url = `/uploads/${companyId}/${filename}`;
    }

    return {
      url,
      filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Get presigned URL for S3 upload
   * Note: Requires AWS SDK to be installed. For now, returns error with instructions.
   */
  async getS3PresignedUrl(
    filename: string,
    contentType: string,
    contentLength: number,
  ): Promise<{ url: string; publicUrl: string }> {
    throw new Error(
      'S3 upload requires AWS SDK. Install with: pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner',
    );
  }

  /**
   * Upload file to Uploadthing
   * Note: Requires Uploadthing SDK and configuration in admin settings
   */
  async uploadToUploadthing(
    file: MulterFile,
  ): Promise<UploadResult> {
    throw new Error(
      'Uploadthing upload requires configuration. Install @uploadthing/core and set it up in admin settings.',
    );
  }

  /**
   * Upload file to Vercel Blob
   * Note: Requires Vercel Blob SDK and configuration in admin settings
   */
  async uploadToVercelBlob(
    file: MulterFile,
    customFilename?: string,
  ): Promise<UploadResult> {
    throw new Error(
      'Vercel Blob upload requires configuration. Install @vercel/blob and set it up in admin settings.',
    );
  }

  /**
   * Delete file from storage
   */
  async deleteFile(url: string, provider: string): Promise<void> {
    switch (provider) {
      case 'local':
        this.deleteLocalFile(url);
        break;
      case 's3':
        await this.deleteS3File(url);
        break;
      case 'uploadthing':
        await this.deleteUploadthingFile(url);
        break;
      case 'vercel-blob':
        await this.deleteVercelBlobFile(url);
        break;
      default:
        throw new Error(`Unknown storage provider: ${provider}`);
    }
  }

  /**
   * Delete local file
   */
  private deleteLocalFile(url: string): void {
    const filepath = path.join(process.cwd(), 'public', url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  /**
   * Delete S3 file
   */
  private async deleteS3File(url: string): Promise<void> {
    // Extract bucket and key from URL
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const match = url.match(/https:\/\/(.+?)\.s3\..+?\.amazonaws\.com\/(.+)/);
    if (!match) {
      console.warn('Invalid S3 URL for deletion:', url);
      return;
    }

    // S3 deletion requires AWS SDK
    // This is a placeholder - implement when AWS SDK is installed
    console.log('S3 file deletion scheduled for:', url);
  }

  /**
   * Delete Uploadthing file
   */
  private async deleteUploadthingFile(url: string): Promise<void> {
    // TODO: Implement Uploadthing delete
    console.log('Uploadthing delete not yet implemented:', url);
  }

  /**
   * Delete Vercel Blob file
   */
  private async deleteVercelBlobFile(url: string): Promise<void> {
    // TODO: Implement Vercel Blob delete
    console.log('Vercel Blob delete not yet implemented:', url);
  }
}
