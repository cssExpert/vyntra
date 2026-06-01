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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const pkg = dto.packageSlug
            ? await this.prisma.package.findFirst({
                where: { slug: dto.packageSlug, isActive: true, isPublic: true },
            })
            : await this.prisma.package.findFirst({
                where: { isActive: true, isPublic: true },
                orderBy: { priceCents: 'asc' },
            });
        if (!pkg) {
            throw new common_1.BadRequestException('No valid package available to subscribe to');
        }
        const passwordHash = await this.hash(dto.password);
        const slug = await this.uniqueOrgSlug(dto.organizationName);
        const user = await this.prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: dto.organizationName,
                    slug,
                    email: dto.email,
                    maxUsers: pkg.maxUsers,
                    subscription: {
                        create: { packageId: pkg.id, billingEmail: dto.email },
                    },
                },
            });
            return tx.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    password: passwordHash,
                    organizationId: org.id,
                    roles: { create: { role: client_1.Role.ORG_ADMIN, organizationId: org.id } },
                },
                include: { roles: true },
            });
        });
        return this.buildAuthResponse({
            id: user.id,
            email: user.email,
            name: user.name,
            superAdmin: user.superAdmin,
            organizationId: user.organizationId,
            roles: user.roles.map((r) => r.role),
        });
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { roles: true },
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        return this.buildAuthResponse({
            id: user.id,
            email: user.email,
            name: user.name,
            superAdmin: user.superAdmin,
            organizationId: user.organizationId,
            roles: user.roles.map((r) => r.role),
        });
    }
    async refresh(refreshToken) {
        let decoded;
        try {
            decoded = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: decoded.sub },
            include: { roles: true },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return this.buildAuthResponse({
            id: user.id,
            email: user.email,
            name: user.name,
            superAdmin: user.superAdmin,
            organizationId: user.organizationId,
            roles: user.roles.map((r) => r.role),
        });
    }
    async hash(password) {
        const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 10);
        return bcrypt.hash(password, rounds);
    }
    async buildAuthResponse(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            superAdmin: user.superAdmin,
            roles: user.roles,
        };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRATION') ?? '24h',
        });
        const refreshToken = await this.jwt.signAsync({ sub: user.id }, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') ?? '7d',
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                superAdmin: user.superAdmin,
                organizationId: user.organizationId,
                roles: user.roles,
            },
            accessToken,
            refreshToken,
        };
    }
    async uniqueOrgSlug(name) {
        const base = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'org';
        let slug = base;
        let n = 1;
        while (await this.prisma.organization.findUnique({ where: { slug } })) {
            slug = `${base}-${n++}`;
        }
        return slug;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map