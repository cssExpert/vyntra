import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminThemesController } from './admin-themes.controller';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ThemesController, AdminThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
