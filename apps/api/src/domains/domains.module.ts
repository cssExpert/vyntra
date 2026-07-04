import { Module } from '@nestjs/common';
import { TagsModule } from '../tags/tags.module';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

@Module({
  imports: [TagsModule],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
