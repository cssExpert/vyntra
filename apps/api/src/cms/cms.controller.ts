import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ── Pages ─────────────────────────────────────────────────────────────────

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

  // ── Menus ─────────────────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('menus')
  listMenus(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.listMenus(orgId);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('menus')
  createMenu(
    @CurrentOrg() orgId: string | null,
    @Body() body: { name: string; slug: string; visibility: string[] },
  ) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.createMenu(orgId, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('menus/:id')
  getMenu(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.getMenu(orgId, id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('menus/:id')
  updateMenu(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; visibility?: string[] },
  ) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.updateMenu(orgId, id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('menus/:id')
  deleteMenu(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.deleteMenu(orgId, id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Put('menus/:id/items')
  setItems(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { items: { label: string; url: string; target?: string }[] },
  ) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.cmsService.setMenuItems(orgId, id, body.items);
  }
}
