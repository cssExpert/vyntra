import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { ThemesService } from './themes.service';

@Controller('admin/themes')
export class AdminThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // GET /admin/themes — list all global themes
  @SuperAdminOnly()
  @Get()
  list() {
    return this.themesService.listGlobal();
  }

  // POST /admin/themes — create a global theme
  @SuperAdminOnly()
  @Post()
  create(
    @Body()
    body: {
      name: string;
      description?: string;
      thumbnail?: string;
      variables?: Record<string, string>;
    },
  ) {
    return this.themesService.createGlobal(body);
  }

  // PATCH /admin/themes/:id — update a global theme
  @SuperAdminOnly()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      thumbnail?: string;
      variables?: Record<string, string>;
    },
  ) {
    return this.themesService.updateGlobal(id, body);
  }

  // DELETE /admin/themes/:id — delete a global theme
  @SuperAdminOnly()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.themesService.deleteGlobal(id);
  }
}
