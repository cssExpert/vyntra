import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { BlocksService } from './blocks.service';

interface BlockBody {
  name?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  blockType?: string;
  data?: Prisma.InputJsonValue;
  isGlobal?: boolean;
  themeIdentifier?: string | null;
  sortOrder?: number;
}

@Controller('admin/blocks')
export class AdminBlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  // GET /admin/blocks — list the full block catalog (global + theme-specific)
  @SuperAdminOnly()
  @Get()
  list() {
    return this.blocksService.listAll();
  }

  // POST /admin/blocks — register a new block preset
  @SuperAdminOnly()
  @Post()
  create(@Body() body: BlockBody) {
    return this.blocksService.create(body);
  }

  // PATCH /admin/blocks/:id — update a block preset
  @SuperAdminOnly()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: BlockBody) {
    return this.blocksService.update(id, body);
  }

  // DELETE /admin/blocks/:id — remove a block preset (cascades TemplateBlock rows)
  @SuperAdminOnly()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.blocksService.delete(id);
  }
}
