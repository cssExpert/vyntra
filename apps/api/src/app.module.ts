import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from './common/guards/module-access.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { CmsModule } from './cms/cms.module';
import { DomainsModule } from './domains/domains.module';
import { ThemesModule } from './themes/themes.module';
import { HealthModule } from './health/health.module';
import { ModulesModule } from './modules/modules.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PackagesModule } from './packages/packages.module';
import { PrismaModule } from './prisma/prisma.module';
import { SystemPageSettingsModule } from './system-pages/system-page-settings.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // Provides ThrottlerGuard for rate-limiting anonymous public endpoints
    // (e.g. storefront product listing). Applied per-route, not globally,
    // so authenticated dashboard traffic is unaffected.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    AdminModule,
    UsersModule,
    OrganizationsModule,
    PackagesModule,
    ModulesModule,
    DomainsModule,
    CmsModule,
    ThemesModule,
    UploadModule,
    StoreModule,
    SystemPageSettingsModule,
    // CrmModule added in the next phase.
  ],
  providers: [
    // Order matters: authenticate → authorize role → check module entitlement.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ModuleAccessGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
