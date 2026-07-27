import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TagsModule } from '../tags/tags.module';
import { OptionalCustomerAuthGuard } from '../store/public/guards/optional-customer-auth.guard';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

@Module({
  imports: [TagsModule, ConfigModule, JwtModule.register({})],
  controllers: [DomainsController],
  providers: [DomainsService, OptionalCustomerAuthGuard],
  exports: [DomainsService],
})
export class DomainsModule {}
