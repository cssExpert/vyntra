import { BadRequestException, Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ModuleKey } from '@vyntra/types';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { UpdateSystemPageSettingsDto } from './dto/update-system-page-settings.dto';
import { SystemPageSettingsService } from './system-page-settings.service';

function requireOrg(orgId: string | null): string {
  if (!orgId) throw new BadRequestException('No organization context');
  return orgId;
}

/**
 * Page Settings (SEO / Open Graph / Favicon / Scripts / Styles) for system pages —
 * app-driven storefront routes like the product listing page. Gated behind the CMS
 * module entitlement since it's the same "Page Settings" capability as CMS pages.
 */
@Controller('cms/system-pages')
@Roles(Role.ORG_ADMIN, Role.EDITOR)
@RequireModule(ModuleKey.CMS)
export class SystemPageSettingsController {
  constructor(private readonly service: SystemPageSettingsService) {}

  @Get(':pageType')
  get(@CurrentOrg() orgId: string | null, @Param('pageType') pageType: string) {
    return this.service.get(requireOrg(orgId), pageType);
  }

  @Patch(':pageType')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('pageType') pageType: string,
    @Body() dto: UpdateSystemPageSettingsDto,
  ) {
    return this.service.update(requireOrg(orgId), pageType, dto);
  }
}
