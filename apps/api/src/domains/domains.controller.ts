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
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { SetCustomDomainDto, SetSubdomainDto } from './dto/domain.dto';
import { DomainsService } from './domains.service';

@Controller()
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  // ── Super admin: full control over any org ────────────────────────────────

  @SuperAdminOnly()
  @Get('admin/companies/:id/domain')
  adminGet(@Param('id') id: string) {
    return this.domainsService.getOrgDomain(id);
  }

  /** Set the platform subdomain for an org (e.g. "acme" → acme.vyntra.com). */
  @SuperAdminOnly()
  @Patch('admin/companies/:id/domain/subdomain')
  adminSetSubdomain(@Param('id') id: string, @Body() dto: SetSubdomainDto) {
    return this.domainsService.setSubdomain(id, dto);
  }

  @SuperAdminOnly()
  @Delete('admin/companies/:id/domain/subdomain')
  adminClearSubdomain(@Param('id') id: string) {
    return this.domainsService.clearSubdomain(id);
  }

  /** Set a custom domain for an org (triggers verification token generation). */
  @SuperAdminOnly()
  @Patch('admin/companies/:id/domain/custom')
  adminSetCustomDomain(
    @Param('id') id: string,
    @Body() dto: SetCustomDomainDto,
  ) {
    return this.domainsService.setCustomDomain(id, dto);
  }

  @SuperAdminOnly()
  @Delete('admin/companies/:id/domain/custom')
  adminClearCustomDomain(@Param('id') id: string) {
    return this.domainsService.clearCustomDomain(id);
  }

  /** Perform a live DNS TXT lookup to verify the custom domain. */
  @SuperAdminOnly()
  @Post('admin/companies/:id/domain/verify')
  adminVerify(@Param('id') id: string) {
    return this.domainsService.verifyCustomDomain(id);
  }

  /**
   * Returns the full DNS record set needed to point a custom domain at the platform.
   * Includes A record (IP), CNAME (www), and TXT verification record.
   */
  @SuperAdminOnly()
  @Get('admin/companies/:id/domain/dns-info')
  adminDnsInfo(@Param('id') id: string) {
    return this.domainsService.getDnsInfo(id);
  }

  // ── ORG_ADMIN: manage their own org's custom domain ──────────────────────

  @Roles(Role.ORG_ADMIN)
  @Get('organizations/me/domain')
  myGet(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.domainsService.getOrgDomain(orgId);
  }

  @Roles(Role.ORG_ADMIN)
  @Patch('organizations/me/domain/custom')
  mySetCustomDomain(
    @CurrentOrg() orgId: string | null,
    @Body() dto: SetCustomDomainDto,
  ) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.domainsService.setCustomDomain(orgId, dto);
  }

  @Roles(Role.ORG_ADMIN)
  @Delete('organizations/me/domain/custom')
  myClearCustomDomain(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.domainsService.clearCustomDomain(orgId);
  }

  @Roles(Role.ORG_ADMIN)
  @Post('organizations/me/domain/verify')
  myVerify(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.domainsService.verifyCustomDomain(orgId);
  }

  @Roles(Role.ORG_ADMIN)
  @Get('organizations/me/domain/dns-info')
  myDnsInfo(@CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('No organization context');
    return this.domainsService.getDnsInfo(orgId);
  }

  // ── Public endpoints used by Next.js public CMS pages ────────────────────

  @Public()
  @Get('public/resolve-subdomain/:subdomain')
  resolveSubdomain(@Param('subdomain') subdomain: string) {
    return this.domainsService.resolveBySubdomain(subdomain);
  }

  @Public()
  @Get('public/resolve-domain')
  resolveDomain(@Query('domain') domain: string) {
    if (!domain)
      throw new BadRequestException('domain query param is required');
    return this.domainsService.resolveByCustomDomain(domain);
  }

  @Public()
  @Get('public/sites/:orgId/landing-page')
  getLandingPage(@Param('orgId') orgId: string) {
    return this.domainsService.getLandingPage(orgId);
  }

  @Public()
  @Get('public/sites/:orgId/pages')
  getPages(@Param('orgId') orgId: string) {
    return this.domainsService.getPublishedPages(orgId);
  }

  @Public()
  @Get('public/sites/:orgId/pages/:slug')
  getPage(@Param('orgId') orgId: string, @Param('slug') slug: string) {
    return this.domainsService.getPublishedPage(orgId, slug);
  }

  @Public()
  @Get('public/sites/:orgId/layout')
  getPublicLayout(
    @Param('orgId') orgId: string,
    @Query('layoutId') layoutId?: string,
  ) {
    return this.domainsService.getPublicLayout(orgId, layoutId || undefined);
  }

  @Public()
  @Get('public/sites/:orgId/menus/:menuId')
  getPublicMenu(
    @Param('orgId') orgId: string,
    @Param('menuId') menuId: string,
  ) {
    return this.domainsService.getPublicMenu(orgId, menuId);
  }

  @Public()
  @Get('public/sites/:orgId/theme')
  getPublicTheme(
    @Param('orgId') orgId: string,
    @Query('previewId') previewId?: string,
  ) {
    return this.domainsService.getPublicTheme(orgId, previewId || undefined);
  }
}
