import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminSettingsDto } from './dto/admin-settings.dto';

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
}
