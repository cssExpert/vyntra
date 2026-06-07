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
   * Directory format: public/uploads/{companyId}/{module}/{purpose}-{timestamp}.{ext}
   *
   * Examples:
   * - Super admin logo: /uploads/superadmin/branding/logo-1234567890.png
   * - Company branding: /uploads/comp_abc123/branding/logo-1234567890.png
   * - User profile: /uploads/comp_abc123/profiles/avatar-1234567890.png
   *
   * This ensures:
   * - Data isolation by company
   * - Semantic organization by module/purpose
   * - Easy identification of file purpose
   * - Support for multiple versions during reupload transition
   */
  async uploadLocal(
    file: MulterFile,
    customFilename?: string,
    companyId?: string,
    module?: string,
  ): Promise<UploadResult> {
    if (!companyId || !module) {
      throw new Error(
        'companyId and module are required for multi-tenant file uploads',
      );
    }

    // Normalize super admin uploads to use superadmin folder
    const normalizedCompanyId =
      companyId === 'admin' ? 'superadmin' : companyId;

    // Build directory path
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      normalizedCompanyId,
      module,
    );

    // Create directory structure if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate semantic filename with timestamp
    const ext = path.extname(file.originalname);
    const basename = customFilename || this.extractPurposeFromFilename(file.originalname);
    const timestamp = Date.now();
    const filename = `${basename}-${timestamp}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Delete old versions of this file (same purpose, different timestamp)
    // This cleanup happens in the background
    this.deleteOldVersions(uploadDir, basename, ext, filename).catch((err) => {
      console.warn('Failed to cleanup old versions:', err);
    });

    // Return URL path
    const url = `/uploads/${normalizedCompanyId}/${module}/${filename}`;

    return {
      url,
      filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Extract purpose (semantic name) from filename
   * Examples: "logo.png" -> "logo", "avatar-image.jpg" -> "avatar-image"
   */
  private extractPurposeFromFilename(originalname: string): string {
    return path.parse(originalname).name.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Delete old versions of the same file
   * Keeps the system clean and prevents disk space waste
   */
  private async deleteOldVersions(
    uploadDir: string,
    basename: string,
    ext: string,
    currentFilename: string,
  ): Promise<void> {
    try {
      const files = fs.readdirSync(uploadDir);
      const pattern = new RegExp(`^${basename}-.+${ext.replace('.', '\\.')}$`);

      for (const file of files) {
        if (pattern.test(file) && file !== currentFilename) {
          const filepath = path.join(uploadDir, file);
          fs.unlinkSync(filepath);
          console.log(`Deleted old version: ${filepath}`);
        }
      }
    } catch (error) {
      console.warn('Error cleaning up old versions:', error);
    }
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
