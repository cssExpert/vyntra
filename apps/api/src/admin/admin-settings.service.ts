import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminSettingsDto } from './dto/admin-settings.dto';
import * as nodemailer from 'nodemailer';

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

      return {
        success: true,
        message: 'SMTP connection successful! Configuration is correct.',
      };
    } catch (error) {
      throw new BadRequestException(
        `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
