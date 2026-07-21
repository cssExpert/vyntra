import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { TemplatesService } from './templates.service';

interface TemplateBody {
  name?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  isGlobal?: boolean;
  themeIdentifier?: string | null;
  blockIds?: string[];
}

@Controller('admin/templates')
export class AdminTemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // GET /admin/templates — list every template with its resolved block composition
  @SuperAdminOnly()
  @Get()
  list() {
    return this.templatesService.listAllAdmin();
  }

  // POST /admin/templates — create a template from an ordered list of block ids
  @SuperAdminOnly()
  @Post()
  create(@Body() body: TemplateBody) {
    return this.templatesService.createAdmin(body);
  }

  // PATCH /admin/templates/:id — update metadata and/or resync block composition
  @SuperAdminOnly()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: TemplateBody) {
    return this.templatesService.updateAdmin(id, body);
  }

  // DELETE /admin/templates/:id — remove a template (cascades TemplateBlock rows)
  @SuperAdminOnly()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.templatesService.deleteAdmin(id);
  }
}
