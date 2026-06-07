import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminSettingsDto } from './dto/admin-settings.dto';
import * as nodemailer from 'nodemailer';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { UTApi } from 'uploadthing/server';
import { normalizeUploadthingToken } from '../upload/upload.service';

@Injectable()
export class AdminSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.adminSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.adminSettings.create({
        data: {},
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateAdminSettingsDto) {
    let settings = await this.prisma.adminSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.adminSettings.create({
        data: dto,
      });
    } else {
      settings = await this.prisma.adminSettings.update({
        where: { id: settings.id },
        data: dto,
      });
    }

    return settings;
  }

  async testSmtpConnection(config: {
    host: string;
    port: number;
    secure?: boolean;
    username?: string;
    password?: string;
    fromEmail: string;
    testEmail?: string;
  }) {
    if (!config.host) {
      throw new BadRequestException('SMTP host is required');
    }
    if (!config.fromEmail) {
      throw new BadRequestException('From email is required');
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure || false,
        auth: {
          user: config.username || undefined,
          pass: config.password || undefined,
        },
      });

      // Verify connection
      await transporter.verify();

      // If testEmail is provided, send a test email
      if (config.testEmail) {
        await transporter.sendMail({
          from: config.fromEmail,
          to: config.testEmail,
          subject: '✓ ERVFlow Email Test',
          html: `
            <h2 style="color: #10b981;">Email Configuration Verified!</h2>
            <p>Hello,</p>
            <p>This is a test email from your ERVFlow instance.</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>From: ${config.fromEmail}</li>
              <li>SMTP Host: ${config.host}</li>
              <li>Port: ${config.port}</li>
              <li>TLS/SSL: ${config.secure ? 'Enabled' : 'Disabled'}</li>
            </ul>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              If you received this email, your SMTP configuration is working correctly!
            </p>
          `,
        });

        return {
          success: true,
          message: `Test email sent to ${config.testEmail}. Check your inbox!`,
        };
      }

      return {
        success: true,
        message: 'SMTP connection successful! Configuration is correct.',
      };
    } catch (error) {
      throw new BadRequestException(
        `SMTP test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async testStorageConnection(config: {
    provider: string;
    s3Config?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    uploadthingConfig?: {
      apiKey: string;
    };
    vercelBlobConfig?: {
      token: string;
    };
  }) {
    try {
      if (config.provider === 'local') {
        return {
          success: true,
          message: 'Local storage is always available.',
        };
      }

      if (config.provider === 's3') {
        if (!config.s3Config?.bucket || !config.s3Config?.region) {
          throw new BadRequestException('S3 bucket and region are required');
        }

        try {
          const s3Client = new S3Client({
            region: config.s3Config.region,
            credentials: {
              accessKeyId: config.s3Config.accessKeyId,
              secretAccessKey: config.s3Config.secretAccessKey,
            },
          });

          const command = new HeadBucketCommand({
            Bucket: config.s3Config.bucket,
          });

          await s3Client.send(command);

          return {
            success: true,
            message: 'S3 connection successful! Bucket is accessible.',
          };
        } catch (error) {
          const errorStr = String(error);
          const errorMessage = error instanceof Error ? error.message : errorStr;

          // Check for specific AWS error codes
          if (errorMessage.includes('AccessDenied') || errorMessage.includes('Forbidden') || errorStr.includes('AccessDenied')) {
            throw new Error('Access denied: Check your AWS credentials and permissions.');
          } else if (errorMessage.includes('NoSuchBucket') || errorMessage.includes('NotFound') || errorStr.includes('NoSuchBucket')) {
            throw new Error(`Bucket not found: "${config.s3Config.bucket}" does not exist in ${config.s3Config.region}.`);
          } else if (errorMessage.includes('InvalidAccessKeyId') || errorMessage.includes('SignatureDoesNotMatch') || errorStr.includes('Invalid')) {
            throw new Error('Invalid AWS credentials: Check your Access Key ID and Secret Access Key.');
          } else if (errorMessage.includes('UnknownError')) {
            throw new Error('Unable to connect to S3: Check your region and credentials.');
          }
          throw error;
        }
      }

      if (config.provider === 'uploadthing') {
        if (!config.uploadthingConfig?.apiKey) {
          throw new BadRequestException('Uploadthing token is required');
        }

        const token = normalizeUploadthingToken(config.uploadthingConfig.apiKey);

        // The v7 SDK expects the UPLOADTHING_TOKEN (base64 JSON, starts with "eyJ"),
        // NOT the "sk_live_" secret key. Guide the user if they pasted the wrong one.
        if (token.startsWith('sk_')) {
          throw new Error(
            'You pasted the legacy secret key (sk_live_…). Use the UPLOADTHING_TOKEN from the "SDK v7+" Quick Copy box on uploadthing.com (it starts with "eyJ").',
          );
        }

        // Actually validate the token by hitting Uploadthing with the SDK.
        try {
          const utapi = new UTApi({ token });
          await utapi.listFiles({ limit: 1 });
        } catch (error) {
          throw new Error(
            'Invalid Uploadthing token. Copy the UPLOADTHING_TOKEN from the "SDK v7+" Quick Copy box on uploadthing.com.',
          );
        }

        return {
          success: true,
          message: 'Uploadthing connection successful! Token is valid.',
        };
      }

      if (config.provider === 'vercel-blob') {
        if (!config.vercelBlobConfig?.token) {
          throw new BadRequestException('Vercel Blob token is required');
        }

        const token = config.vercelBlobConfig.token;

        // Vercel Blob tokens should be base64-encoded or start with specific prefixes
        if (token.length < 10) {
          throw new Error('Vercel Blob token appears to be too short. Please verify you copied the complete token.');
        }

        // For Vercel Blob, we do a basic format validation.
        // Full validation would require making an API call to Vercel's infrastructure.
        // Users can test uploads directly in their application.
        return {
          success: true,
          message: 'Vercel Blob token format is valid. Settings have been saved - test uploads in your app to fully verify.',
        };
      }

      throw new BadRequestException(`Unknown storage provider: ${config.provider}`);
    } catch (error) {
      throw new BadRequestException(
        `Storage connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
