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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateProfileDto,
  UpdateUserDto,
  UpdateUserRoleDto,
} from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ── Self profile (declared before :id) ──
  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Put('me/password')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changeOwnPassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  // ── Org-scoped management (ORG_ADMIN; super admin bypasses) ──
  @Roles(Role.ORG_ADMIN)
  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listOrgUsers(this.orgId(user));
  }

  @Roles(Role.ORG_ADMIN)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.usersService.createInOrg(this.orgId(user), dto);
  }

  @Roles(Role.ORG_ADMIN)
  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.findOneInOrg(this.orgId(user), id);
  }

  @Roles(Role.ORG_ADMIN)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateInOrg(this.orgId(user), id, dto);
  }

  @Roles(Role.ORG_ADMIN)
  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.removeFromOrg(this.orgId(user), id);
  }

  @Roles(Role.ORG_ADMIN)
  @Put(':id/role')
  setRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.setOrgRole(this.orgId(user), id, dto.role);
  }

  private orgId(user: AuthenticatedUser): string {
    if (!user.organizationId) {
      throw new BadRequestException('No organization context for this user');
    }
    return user.organizationId;
  }
}
