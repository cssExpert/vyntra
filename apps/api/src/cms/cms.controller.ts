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

function requireOrg(orgId: string | null): string {
  if (!orgId) throw new BadRequestException('No organization context');
  return orgId;
}

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ── Pages ─────────────────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('pages')
  listPages(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listPages(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('blogs')
  listBlogs(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listBlogs(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('blogs')
  createBlog(
    @CurrentOrg() orgId: string | null,
    @Body() body: {
      title: string; subtitle?: string; slug: string; body?: string;
      excerpt?: string; coverImage?: string; tags?: string[]; author?: string;
      category?: string; seoTitle?: string; metaDesc?: string; keywords?: string;
      published?: boolean; publishedAt?: string | null; visibility?: string;
      allowComments?: boolean; isFeatured?: boolean; pinToTop?: boolean;
    },
  ) {
    return this.cmsService.createBlog(requireOrg(orgId), body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('blogs/:id')
  getBlog(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.getBlog(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('blogs/:id')
  updateBlog(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: {
      title?: string; subtitle?: string; slug?: string; body?: string;
      excerpt?: string; coverImage?: string; tags?: string[]; author?: string;
      category?: string; seoTitle?: string; metaDesc?: string; keywords?: string;
      published?: boolean; publishedAt?: string | null; visibility?: string;
      allowComments?: boolean; isFeatured?: boolean; pinToTop?: boolean;
    },
  ) {
    return this.cmsService.updateBlog(requireOrg(orgId), id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('blogs/:id')
  deleteBlog(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteBlog(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('pages/:slug')
  load(@CurrentOrg() orgId: string | null, @Param('slug') slug: string) {
    return this.cmsService.loadPage(requireOrg(orgId), slug);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('pages/:slug')
  save(
    @CurrentOrg() orgId: string | null,
    @Param('slug') slug: string,
    @Body() body: { content: string; publish?: boolean; layoutId?: string | null },
  ) {
    return this.cmsService.savePage(requireOrg(orgId), slug, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Put('pages/bulk-layout')
  bulkUpdateLayout(
    @CurrentOrg() orgId: string | null,
    @Body() body: { pageIds: string[]; layoutId: string | null },
  ) {
    return this.cmsService.bulkUpdatePageLayout(requireOrg(orgId), body.pageIds, body.layoutId ?? null);
  }

  // ── Layouts ───────────────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('layouts')
  listLayouts(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listLayouts(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('layouts')
  createLayout(
    @CurrentOrg() orgId: string | null,
    @Body() body: {
      name: string;
      isDefault?: boolean;
      navMenuId?: string | null;
      footerColumns?: { title: string; menuId: string }[];
    },
  ) {
    return this.cmsService.createLayout(requireOrg(orgId), body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('layouts/:id')
  getLayout(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.getLayout(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('layouts/:id')
  updateLayout(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      isDefault?: boolean;
      navMenuId?: string | null;
      footerColumns?: { title: string; menuId: string }[];
    },
  ) {
    return this.cmsService.updateLayout(requireOrg(orgId), id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('layouts/:id')
  deleteLayout(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteLayout(requireOrg(orgId), id);
  }

  // ── Menus ─────────────────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('menus')
  listMenus(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listMenus(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('menus')
  createMenu(
    @CurrentOrg() orgId: string | null,
    @Body() body: { name: string; slug: string; visibility: string[] },
  ) {
    return this.cmsService.createMenu(requireOrg(orgId), body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('menus/:id')
  getMenu(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.getMenu(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('menus/:id')
  updateMenu(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; visibility?: string[] },
  ) {
    return this.cmsService.updateMenu(requireOrg(orgId), id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('menus/:id')
  deleteMenu(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteMenu(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Put('menus/:id/items')
  setItems(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { items: { label: string; url: string; target?: string; visibility?: string[] }[] },
  ) {
    return this.cmsService.setMenuItems(requireOrg(orgId), id, body.items);
  }
}
