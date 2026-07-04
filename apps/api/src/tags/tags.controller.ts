import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { TagsService } from './tags.service';

function requireOrg(orgId: string | null): string {
  if (!orgId) throw new BadRequestException('No organization context');
  return orgId;
}

/** Shared, org-scoped tag catalog — reused by blogs, products, and any future taggable feature. */
@Controller('tags')
@Roles(Role.ORG_ADMIN, Role.EDITOR)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.tagsService.listTags(requireOrg(orgId));
  }

  @Post()
  findOrCreate(@CurrentOrg() orgId: string | null, @Body() body: { name: string }) {
    return this.tagsService.findOrCreateTag(requireOrg(orgId), body.name);
  }

  @Delete(':id')
  remove(@CurrentOrg() orgId: string | null, @Param('id') id: string) {
    return this.tagsService.deleteTag(requireOrg(orgId), id);
  }
}
