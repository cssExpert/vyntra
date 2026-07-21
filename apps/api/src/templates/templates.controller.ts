import { BadRequestException, Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { TemplatesService } from './templates.service';

function requireOrg(orgId: string | null): string {
  if (!orgId) throw new BadRequestException('No organization context');
  return orgId;
}

@Controller('cms/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // GET /cms/templates — global templates + templates for the org's active theme,
  // each with its blocks fully resolved (blockType + data) for the page editor's picker
  @Roles(Role.ORG_ADMIN, Role.EDITOR)
  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.templatesService.listForOrg(requireOrg(orgId));
  }
}
