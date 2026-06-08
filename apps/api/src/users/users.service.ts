import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateProfileDto,
  UpdateUserDto,
} from './dto/user.dto';

// Never leak password hashes.
const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  superAdmin: true,
  isActive: true,
  organizationId: true,
  lastLogin: true,
  createdAt: true,
  roles: { select: { role: true, organizationId: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── Org-scoped (ORG_ADMIN) ───────────────────────────────

  listOrgUsers(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneInOrg(organizationId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      select: SAFE_SELECT,
    });
    if (!user) throw new NotFoundException('User not found in this organization');
    return user;
  }

  async createInOrg(organizationId: string, dto: CreateUserDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const count = await this.prisma.user.count({ where: { organizationId } });
    if (count >= org.maxUsers) {
      throw new ForbiddenException(
        `User limit reached for this plan (${org.maxUsers})`,
      );
    }

    const password = await this.hash(dto.password);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password,
        organizationId,
        roles: {
          create: { role: dto.role ?? Role.USER, organizationId },
        },
      },
      select: SAFE_SELECT,
    });
  }

  async updateInOrg(organizationId: string, id: string, dto: UpdateUserDto) {
    await this.findOneInOrg(organizationId, id);
    return this.prisma.user.update({
      where: { id },
      data: { name: dto.name, isActive: dto.isActive },
      select: SAFE_SELECT,
    });
  }

  async removeFromOrg(organizationId: string, id: string) {
    await this.findOneInOrg(organizationId, id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  /** Replace the user's role within their organization. */
  async setOrgRole(organizationId: string, id: string, role: Role) {
    await this.findOneInOrg(organizationId, id);
    if (role === Role.SUPER_ADMIN) {
      throw new BadRequestException('SUPER_ADMIN cannot be assigned as an org role');
    }
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id, organizationId } }),
      this.prisma.userRole.create({
        data: { userId: id, organizationId, role },
      }),
    ]);
    return this.findOneInOrg(organizationId, id);
  }

  // ── Self profile ─────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      select: SAFE_SELECT,
    });
  }

  /** Change your own password after verifying the current one. */
  async changeOwnPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) {
      throw new BadRequestException('No password is set for this account');
    }
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new BadRequestException('Current password is incorrect');
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await this.hash(newPassword) },
    });
    return { success: true };
  }

  // ── Super admin ──────────────────────────────────────────

  listAll() {
    return this.prisma.user.findMany({
      select: { ...SAFE_SELECT, organization: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async promoteToSuperAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { superAdmin: true },
      select: SAFE_SELECT,
    });
  }

  /** Set a new password for any user (super admin only). */
  async setPassword(id: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({
      where: { id },
      data: { password: await this.hash(password) },
    });
    return { success: true };
  }

  /** Lock or unlock any user account (super admin only). */
  async setActive(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: SAFE_SELECT,
    });
  }

  // ── helpers ──────────────────────────────────────────────

  private hash(password: string) {
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
    return bcrypt.hash(password, rounds);
  }
}
