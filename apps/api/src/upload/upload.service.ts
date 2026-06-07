import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { UTApi } from 'uploadthing/server';
import type { Express } from 'express';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface MigrationReportItem {
  model: string;
  id: string;
  field: string;
  from: string;
  to?: string;
  error?: string;
}

export interface MigrationReport {
  provider: string;
  total: number;
  migrated: number;
  failed: number;
  details: MigrationReportItem[];
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

/**
 * Normalize an Uploadthing token. Clicking "Copy" on the dashboard yields the
 * whole env line (e.g. `UPLOADTHING_TOKEN='eyJ...'`), so strip the prefix and
 * surrounding quotes/whitespace to get the bare token value.
 */
export function normalizeUploadthingToken(raw: string): string {
  return raw
    .trim()
    .replace(/^UPLOADTHING_TOKEN\s*=\s*/i, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();
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
   * Upload file to S3 with multi-tenant directory structure
   */
  async uploadToS3(
    file: MulterFile,
    companyId: string,
    module: string,
    customFilename?: string,
  ): Promise<UploadResult> {
    const settings = await this.prisma.adminSettings.findFirst();
    const s3Config = settings?.s3Config as any;

    if (!s3Config?.bucket || !s3Config?.region) {
      throw new Error('S3 configuration not found in admin settings');
    }

    const normalizedCompanyId = companyId === 'admin' ? 'superadmin' : companyId;
    const ext = path.extname(file.originalname);
    const basename = customFilename || this.extractPurposeFromFilename(file.originalname);
    const timestamp = Date.now();
    const filename = `${basename}-${timestamp}${ext}`;
    const key = `uploads/${normalizedCompanyId}/${module}/${filename}`;

    try {
      const s3Client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      // Build the URL
      const url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;

      return {
        url,
        filename,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new Error(
        `S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload file to Uploadthing with multi-tenant directory structure
   */
  async uploadToUploadthing(
    file: MulterFile,
    companyId?: string,
    module?: string,
    customFilename?: string,
  ): Promise<UploadResult> {
    const settings = await this.prisma.adminSettings.findFirst();
    const uploadthingConfig = settings?.uploadthingConfig as any;

    if (!uploadthingConfig?.apiKey) {
      throw new Error('Uploadthing API key not found in admin settings');
    }

    const normalizedCompanyId = companyId === 'admin' ? 'superadmin' : companyId;
    const ext = path.extname(file.originalname);
    const basename = customFilename || this.extractPurposeFromFilename(file.originalname);
    const timestamp = Date.now();
    // Encode the multi-tenant path into the filename since Uploadthing has a flat namespace
    const filename = `${normalizedCompanyId}__${module}__${basename}-${timestamp}${ext}`;

    try {
      // Use the official Uploadthing SDK (UTApi) which handles their multi-step upload flow.
      // The token is the v7 "UPLOADTHING_TOKEN" (base64 string starting with "eyJ").
      const utapi = new UTApi({
        token: normalizeUploadthingToken(uploadthingConfig.apiKey),
      });

      // Build a File from the in-memory buffer (Node 20+ has a global File).
      const utFile = new File([new Uint8Array(file.buffer)], filename, {
        type: file.mimetype,
      });

      const result = await utapi.uploadFiles(utFile);

      if (result.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }

      // Prefer the new ufsUrl field; fall back to the deprecated url field.
      const uploadthingUrl = result.data?.ufsUrl || result.data?.url;

      if (!uploadthingUrl) {
        throw new Error('No file URL returned from Uploadthing');
      }

      return {
        url: uploadthingUrl,
        filename: result.data?.name || filename,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new Error(
        `Uploadthing upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload file to Vercel Blob with multi-tenant directory structure
   */
  async uploadToVercelBlob(
    file: MulterFile,
    companyId?: string,
    module?: string,
    customFilename?: string,
  ): Promise<UploadResult> {
    const settings = await this.prisma.adminSettings.findFirst();
    const vercelBlobConfig = settings?.vercelBlobConfig as any;

    if (!vercelBlobConfig?.token) {
      throw new Error('Vercel Blob token not found in admin settings');
    }

    // For now, return a placeholder message
    // Full Vercel Blob integration would require @vercel/blob SDK
    throw new Error(
      'Vercel Blob upload integration requires additional setup. Please configure and test your Vercel Blob token in Admin Settings → Storage.',
    );
  }

  /**
   * Migrate all locally-stored images to the active cloud provider.
   *
   * Scans the DB fields that hold uploaded image URLs, and for each value that
   * still points at local storage (`/uploads/...`), re-uploads the file to the
   * configured cloud provider and rewrites the DB reference to the new URL.
   *
   * Non-destructive: local files are left on disk so the old URLs keep working
   * until you choose to clean them up.
   */
  async migrateLocalToCloud(): Promise<MigrationReport> {
    const settings = await this.prisma.adminSettings.findFirst();
    const provider = settings?.storageProvider || 'local';

    if (provider === 'local') {
      throw new Error(
        'Select a cloud provider (Uploadthing or S3) in Storage settings before migrating.',
      );
    }

    const report: MigrationReport = {
      provider,
      total: 0,
      migrated: 0,
      failed: 0,
      details: [],
    };

    // DB fields that store uploaded image URLs (MenuItem.url is a nav link — excluded).
    const targets: Array<{ model: string; fields: string[] }> = [
      { model: 'organization', fields: ['logoUrl', 'faviconUrl'] },
      { model: 'theme', fields: ['thumbnail'] },
      { model: 'media', fields: ['url'] },
      { model: 'adminSettings', fields: ['logoUrl', 'faviconUrl'] },
    ];

    for (const target of targets) {
      const rows = await (this.prisma as any)[target.model].findMany();

      for (const row of rows) {
        for (const field of target.fields) {
          const value: string | null = row[field];
          if (!value || !value.includes('/uploads/')) continue;

          report.total++;
          try {
            const newUrl = await this.migrateOneUrl(value, provider);
            await (this.prisma as any)[target.model].update({
              where: { id: row.id },
              data: { [field]: newUrl },
            });
            report.migrated++;
            report.details.push({
              model: target.model,
              id: row.id,
              field,
              from: value,
              to: newUrl,
            });
          } catch (error) {
            report.failed++;
            report.details.push({
              model: target.model,
              id: row.id,
              field,
              from: value,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    }

    return report;
  }

  /**
   * Re-upload a single local file (identified by its URL) to the cloud provider
   * and return the new cloud URL.
   */
  private async migrateOneUrl(
    localUrl: string,
    provider: string,
  ): Promise<string> {
    const marker = '/uploads/';
    const idx = localUrl.indexOf(marker);
    const relative = localUrl.substring(idx + marker.length); // e.g. superadmin/branding/logo-123.png
    const filePath = path.join(process.cwd(), 'public', 'uploads', relative);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found on disk: ${relative}`);
    }

    const buffer = fs.readFileSync(filePath);
    const originalname = path.basename(relative);
    const mimetype = this.guessMimeType(originalname);

    // Derive companyId/module from the path when present, else sensible defaults.
    const parts = relative.split('/');
    const companyId = parts.length >= 3 ? parts[0] : 'superadmin';
    const module = parts.length >= 3 ? parts[1] : 'migrated';

    const file = {
      buffer,
      originalname,
      mimetype,
      size: buffer.length,
    } as MulterFile;

    let result: UploadResult;
    if (provider === 's3') {
      result = await this.uploadToS3(file, companyId, module);
    } else if (provider === 'uploadthing') {
      result = await this.uploadToUploadthing(file, companyId, module);
    } else if (provider === 'vercel-blob') {
      result = await this.uploadToVercelBlob(file, companyId, module);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return result.url;
  }

  private guessMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const map: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.bmp': 'image/bmp',
    };
    return map[ext] || 'application/octet-stream';
  }

  /**
   * Get presigned URL for S3 upload
   */
  async getS3PresignedUrl(
    filename: string,
    contentType: string,
    contentLength: number,
  ): Promise<{ url: string; publicUrl: string }> {
    throw new Error(
      'S3 presigned URL generation is not yet implemented',
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
    const settings = await this.prisma.adminSettings.findFirst();
    const uploadthingConfig = settings?.uploadthingConfig as any;

    if (!uploadthingConfig?.apiKey) {
      console.warn('Uploadthing token not configured; skipping delete');
      return;
    }

    // Uploadthing file URLs end with the file key: https://<appId>.ufs.sh/f/<key>
    const fileKey = url.split('/').pop();
    if (!fileKey) {
      console.warn('Could not extract Uploadthing file key from URL:', url);
      return;
    }

    try {
      const utapi = new UTApi({
        token: normalizeUploadthingToken(uploadthingConfig.apiKey),
      });
      await utapi.deleteFiles(fileKey);
    } catch (error) {
      console.warn('Uploadthing delete failed:', error);
    }
  }

  /**
   * Delete Vercel Blob file
   */
  private async deleteVercelBlobFile(url: string): Promise<void> {
    // TODO: Implement Vercel Blob delete
    console.log('Vercel Blob delete not yet implemented:', url);
  }
}
