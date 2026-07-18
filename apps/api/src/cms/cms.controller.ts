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
  @Get('dashboard')
  getDashboardStats(@CurrentOrg() orgId: string | null) {
    return this.cmsService.getDashboardStats(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('blogs')
  listBlogs(
    @CurrentOrg() orgId: string | null,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('take') take?: string,
    @Query('published') published?: string,
  ) {
    return this.cmsService.listBlogs(requireOrg(orgId), {
      category,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
      take: take ? parseInt(take, 10) : undefined,
      published: published === 'true' ? true : published === 'false' ? false : undefined,
    });
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

  // ── Blog Categories ───────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('blog-categories')
  listBlogCategories(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listBlogCategories(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('blog-categories')
  createBlogCategory(
    @CurrentOrg() orgId: string | null,
    @Body() body: { name: string; slug: string; description?: string },
  ) {
    return this.cmsService.createBlogCategory(requireOrg(orgId), body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('blog-categories/:id')
  updateBlogCategory(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; description?: string },
  ) {
    return this.cmsService.updateBlogCategory(requireOrg(orgId), id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('blog-categories/:id')
  deleteBlogCategory(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteBlogCategory(requireOrg(orgId), id);
  }

  // Blog Tags: superseded by the shared /tags catalog (see TagsController).

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
    @Body() body: { content: string; publish?: boolean; layoutId?: string | null; themeId?: string | null },
  ) {
    return this.cmsService.savePage(requireOrg(orgId), slug, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('pages/:slug/settings')
  saveSettings(
    @CurrentOrg() orgId: string | null,
    @Param('slug') slug: string,
    @Body()
    body: {
      title?: string;
      metaDesc?: string;
      metaKeywords?: string;
      noIndex?: boolean;
      ogTitle?: string;
      ogDescription?: string;
      ogType?: string;
      ogUrl?: string;
      ogImage?: string | null;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string | null;
      twitterCardSize?: string;
      faviconUrl?: string | null;
      headScript?: string;
      bodyScript?: string;
      customCss?: string;
    },
  ) {
    return this.cmsService.updatePageSettings(requireOrg(orgId), slug, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Put('pages/bulk-layout')
  bulkUpdateLayout(
    @CurrentOrg() orgId: string | null,
    @Body() body: { pageIds: string[]; layoutId: string | null },
  ) {
    return this.cmsService.bulkUpdatePageLayout(requireOrg(orgId), body.pageIds, body.layoutId ?? null);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('pages/:id')
  deletePage(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deletePage(requireOrg(orgId), id);
  }

  // ── Page Translations ────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('pages/:id/translations')
  listPageTranslations(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.listPageTranslations(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Put('pages/:id/translations/:lang')
  upsertPageTranslation(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Param('lang') lang: string,
    @Body() body: { title: string; content?: string | null; metaDesc?: string | null; metaKeywords?: string | null },
  ) {
    return this.cmsService.upsertPageTranslation(requireOrg(orgId), id, lang, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('pages/:id/translations/:lang')
  deletePageTranslation(@CurrentOrg() orgId: string | null, @Param('id') id: string, @Param('lang') lang: string) {
    return this.cmsService.deletePageTranslation(requireOrg(orgId), id, lang);
  }

  // ── Theme Installer ───────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN)
  @Get('themes/:identifier/install-preview')
  getThemeInstallPreview(
    @CurrentOrg() orgId: string | null,
    @Param('identifier') identifier: string,
  ) {
    return this.cmsService.getThemeInstallPreview(requireOrg(orgId), identifier);
  }

  @Roles(Role.ORG_ADMIN)
  @Post('themes/:identifier/install')
  installTheme(
    @CurrentOrg() orgId: string | null,
    @Param('identifier') identifier: string,
    @Body() body: {
      pageSlugs?: string[];
      installMenus?: boolean;
      installLayout?: boolean;
      overwrite?: boolean;
    },
  ) {
    return this.cmsService.installTheme(requireOrg(orgId), identifier, {
      pageSlugs: body.pageSlugs ?? [],
      installMenus: body.installMenus ?? true,
      installLayout: body.installLayout ?? true,
      overwrite: body.overwrite ?? false,
    });
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

  // ── Forms ─────────────────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('forms')
  listForms(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listForms(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('forms/:id')
  getForm(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.getFormById(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('forms')
  createForm(
    @CurrentOrg() orgId: string | null,
    @Body() body: { name: string; description?: string; slug: string; status?: string; fields?: unknown[]; captchaEnabled?: boolean; submitButton?: unknown; settings?: unknown },
  ) {
    return this.cmsService.createForm(requireOrg(orgId), body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('forms/:id')
  updateForm(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; slug?: string; status?: string; fields?: unknown[]; captchaEnabled?: boolean; submitButton?: unknown; settings?: unknown },
  ) {
    return this.cmsService.updateForm(requireOrg(orgId), id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('forms/:id')
  deleteForm(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteFormById(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('forms/:id/duplicate')
  duplicateForm(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.duplicateForm(requireOrg(orgId), id);
  }

  @Post('forms/verify-captcha')
  verifyCaptcha(@Body() body: { token: string }) {
    return this.cmsService.verifyCaptcha(body.token);
  }

  // ── Contact Requests (storefront Contact Form / Contact Form + Info blocks) ─

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('contact-requests')
  listContactSubmissions(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listContactSubmissions(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('contact-requests/:id')
  updateContactSubmissionStatus(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.cmsService.updateContactSubmissionStatus(requireOrg(orgId), id, body.status);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('contact-requests/:id')
  deleteContactSubmission(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteContactSubmission(requireOrg(orgId), id);
  }

  // ── Newsletter Subscribers (storefront footer newsletter signup) ───────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('newsletter-subscribers')
  listNewsletterSubscribers(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listNewsletterSubscribers(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('newsletter-subscribers/:id')
  deleteNewsletterSubscriber(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteNewsletterSubscriber(requireOrg(orgId), id);
  }

  // ── Comments (blog/page/product discussion) ─────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('comments')
  listComments(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listComments(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('comments/:id')
  updateCommentStatus(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.cmsService.updateCommentStatus(requireOrg(orgId), id, body.status);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('comments/:id')
  deleteComment(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteComment(requireOrg(orgId), id);
  }

  // ── Galleries ─────────────────────────────────────────────────────────────────

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('galleries')
  listGalleries(@CurrentOrg() orgId: string | null) {
    return this.cmsService.listGalleries(requireOrg(orgId));
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('galleries')
  createGallery(
    @CurrentOrg() orgId: string | null,
    @Body() body: {
      title: string; description?: string; category?: string;
      status?: 'draft' | 'published'; coverUrl?: string; tags?: string[];
    },
  ) {
    return this.cmsService.createGallery(requireOrg(orgId), body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get('galleries/:id')
  getGallery(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.getGallery(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Patch('galleries/:id')
  updateGallery(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: {
      title?: string; description?: string; category?: string;
      status?: 'draft' | 'published'; coverUrl?: string; tags?: string[];
    },
  ) {
    return this.cmsService.updateGallery(requireOrg(orgId), id, body);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('galleries/:id')
  deleteGallery(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.cmsService.deleteGallery(requireOrg(orgId), id);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Post('galleries/:id/items')
  addGalleryItems(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Body() body: { items: { url: string; label?: string }[] },
  ) {
    return this.cmsService.addGalleryItems(requireOrg(orgId), id, body.items);
  }

  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Delete('galleries/:id/items/:itemId')
  deleteGalleryItem(
    @CurrentOrg() orgId: string | null,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cmsService.deleteGalleryItem(requireOrg(orgId), id, itemId);
  }
}
