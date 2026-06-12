import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ThemesService } from './themes.service';

function requireOrg(orgId: string | null): string {
  if (!orgId) throw new BadRequestException('No organization context');
  return orgId;
}

@Controller('cms/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // GET /cms/themes — list global themes + activeThemeId
  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.themesService.listForOrg(requireOrg(orgId));
  }

  // GET /cms/themes/active — currently active theme object
  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('active')
  getActive(@CurrentOrg() orgId: string | null) {
    return this.themesService.getActiveTheme(requireOrg(orgId));
  }

  // POST /cms/themes/:id/activate — set active theme for this org
  @Roles(Role.ORG_ADMIN)
  @Post(':id/activate')
  activate(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.themesService.activateTheme(requireOrg(orgId), id);
  }

  // DELETE /cms/themes/active — remove active theme (use platform default)
  @Roles(Role.ORG_ADMIN)
  @Delete('active/clear')
  deactivate(@CurrentOrg() orgId: string | null) {
    return this.themesService.deactivateTheme(requireOrg(orgId));
  }
}
