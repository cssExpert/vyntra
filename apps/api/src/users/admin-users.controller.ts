import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { SuperAdminOnly } from '../common/decorators/super-admin.decorator';
import { SetUserActiveDto, SetUserPasswordDto } from './dto/user.dto';
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

  @Put(':id/password')
  setPassword(@Param('id') id: string, @Body() dto: SetUserPasswordDto) {
    return this.usersService.setPassword(id, dto.password);
  }

  @Put(':id/lock')
  setActive(@Param('id') id: string, @Body() dto: SetUserActiveDto) {
    return this.usersService.setActive(id, dto.isActive);
  }
}
