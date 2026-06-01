"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PackagesService = class PackagesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.include = { modules: { include: { module: true } } };
    }
    serialize(pkg) {
        return {
            ...pkg,
            modules: (pkg.modules ?? []).map((pm) => pm.module.key),
        };
    }
    async findAll() {
        const pkgs = await this.prisma.package.findMany({
            include: this.include,
            orderBy: { priceCents: 'asc' },
        });
        return pkgs.map((p) => this.serialize(p));
    }
    async findPublic() {
        const pkgs = await this.prisma.package.findMany({
            where: { isActive: true, isPublic: true },
            include: this.include,
            orderBy: { priceCents: 'asc' },
        });
        return pkgs.map((p) => this.serialize(p));
    }
    async findOne(id) {
        const pkg = await this.prisma.package.findUnique({
            where: { id },
            include: this.include,
        });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        return this.serialize(pkg);
    }
    async create(dto) {
        const slug = await this.uniqueSlug(dto.name);
        const moduleIds = await this.resolveModuleIds(dto.moduleKeys);
        const pkg = await this.prisma.package.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                priceCents: dto.priceCents ?? 0,
                billingCycle: dto.billingCycle,
                maxUsers: dto.maxUsers ?? 5,
                isActive: dto.isActive ?? true,
                isPublic: dto.isPublic ?? true,
                modules: { create: moduleIds.map((moduleId) => ({ moduleId })) },
            },
            include: this.include,
        });
        return this.serialize(pkg);
    }
    async update(id, dto) {
        await this.findOne(id);
        const moduleIds = dto.moduleKeys !== undefined
            ? await this.resolveModuleIds(dto.moduleKeys)
            : undefined;
        const pkg = await this.prisma.$transaction(async (tx) => {
            if (moduleIds !== undefined) {
                await tx.packageModule.deleteMany({ where: { packageId: id } });
            }
            return tx.package.update({
                where: { id },
                data: {
                    name: dto.name,
                    description: dto.description,
                    priceCents: dto.priceCents,
                    billingCycle: dto.billingCycle,
                    maxUsers: dto.maxUsers,
                    isActive: dto.isActive,
                    isPublic: dto.isPublic,
                    ...(moduleIds !== undefined && {
                        modules: { create: moduleIds.map((moduleId) => ({ moduleId })) },
                    }),
                },
                include: this.include,
            });
        });
        return this.serialize(pkg);
    }
    async remove(id) {
        await this.findOne(id);
        const inUse = await this.prisma.subscription.count({
            where: { packageId: id },
        });
        if (inUse > 0) {
            throw new common_1.ConflictException('Cannot delete a package that organizations are subscribed to');
        }
        await this.prisma.package.delete({ where: { id } });
        return { success: true };
    }
    async resolveModuleIds(keys) {
        if (!keys || keys.length === 0)
            return [];
        const normalized = [...new Set(keys.map((k) => k.trim().toUpperCase()))];
        const modules = await this.prisma.module.findMany({
            where: { key: { in: normalized } },
        });
        if (modules.length !== normalized.length) {
            const found = new Set(modules.map((m) => m.key));
            const missing = normalized.filter((k) => !found.has(k));
            throw new common_1.BadRequestException(`Unknown module(s): ${missing.join(', ')}`);
        }
        return modules.map((m) => m.id);
    }
    async uniqueSlug(name) {
        const base = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'package';
        let slug = base;
        let n = 1;
        while (await this.prisma.package.findUnique({ where: { slug } })) {
            slug = `${base}-${n++}`;
        }
        return slug;
    }
};
exports.PackagesService = PackagesService;
exports.PackagesService = PackagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PackagesService);
//# sourceMappingURL=packages.service.js.map