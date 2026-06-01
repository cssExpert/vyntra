import { Controller, Get, Param, Put } from '@nestjs/common';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { UsersService } from './users.service';

/** Cross-org user management — super admin only. */
@SuperAdminOnly()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  listAll() {
    return this.usersService.listAll();
  }

  @Put(':id/promote')
  promote(@Param('id') id: string) {
    return this.usersService.promoteToSuperAdmin(id);
  }
}
