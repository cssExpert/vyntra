import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');

  async onModuleInit() {
    for (let i = 1; i <= 5; i++) {
      try {
        await this.$connect();
        this.logger.log('✅ Database connected');
        return;
      } catch (err) {
        this.logger.warn(`DB connect attempt ${i}/5 failed, retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    this.logger.error('❌ Could not connect to database after 5 attempts');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
