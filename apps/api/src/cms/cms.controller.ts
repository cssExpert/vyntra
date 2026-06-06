import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('pages/:slug')
  load(@CurrentOrg() orgId: string | null, @Param('slug') slug: string) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.loadPage(orgId, slug);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('pages/:slug')
  save(
    @CurrentOrg() orgId: string | null,
    @Param('slug') slug: string,
    @Body() body: { content: string; publish?: boolean },
  ) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.savePage(orgId, slug, body);
  }
}
