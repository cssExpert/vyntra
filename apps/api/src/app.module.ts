import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ModuleAccessGuard } from './common/guards/module-access.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { CmsModule } from './cms/cms.module';
import { DomainsModule } from './domains/domains.module';
import { HealthModule } from './health/health.module';
import { ModulesModule } from './modules/modules.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PackagesModule } from './packages/packages.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    PackagesModule,
    ModulesModule,
    DomainsModule,
    CmsModule,
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
