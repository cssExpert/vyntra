"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
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
};
let UsersService = class UsersService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    listOrgUsers(organizationId) {
        return this.prisma.user.findMany({
            where: { organizationId },
            select: SAFE_SELECT,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneInOrg(organizationId, id) {
        const user = await this.prisma.user.findFirst({
            where: { id, organizationId },
            select: SAFE_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found in this organization');
        return user;
    }
    async createInOrg(organizationId, dto) {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const count = await this.prisma.user.count({ where: { organizationId } });
        if (count >= org.maxUsers) {
            throw new common_1.ForbiddenException(`User limit reached for this plan (${org.maxUsers})`);
        }
        const password = await this.hash(dto.password);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password,
                organizationId,
                roles: {
                    create: { role: dto.role ?? client_1.Role.USER, organizationId },
                },
            },
            select: SAFE_SELECT,
        });
    }
    async updateInOrg(organizationId, id, dto) {
        await this.findOneInOrg(organizationId, id);
        return this.prisma.user.update({
            where: { id },
            data: { name: dto.name, isActive: dto.isActive },
            select: SAFE_SELECT,
        });
    }
    async removeFromOrg(organizationId, id) {
        await this.findOneInOrg(organizationId, id);
        await this.prisma.user.delete({ where: { id } });
        return { success: true };
    }
    async setOrgRole(organizationId, id, role) {
        await this.findOneInOrg(organizationId, id);
        if (role === client_1.Role.SUPER_ADMIN) {
            throw new common_1.BadRequestException('SUPER_ADMIN cannot be assigned as an org role');
        }
        await this.prisma.$transaction([
            this.prisma.userRole.deleteMany({ where: { userId: id, organizationId } }),
            this.prisma.userRole.create({
                data: { userId: id, organizationId, role },
            }),
        ]);
        return this.findOneInOrg(organizationId, id);
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: SAFE_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    updateProfile(userId, dto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { name: dto.name },
            select: SAFE_SELECT,
        });
    }
    listAll() {
        return this.prisma.user.findMany({
            select: { ...SAFE_SELECT, organization: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async promoteToSuperAdmin(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({
            where: { id },
            data: { superAdmin: true },
            select: SAFE_SELECT,
        });
    }
    hash(password) {
        const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
        return bcrypt.hash(password, rounds);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map