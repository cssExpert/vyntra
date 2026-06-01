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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrganizationsService = class OrganizationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.organization.findMany({
            include: {
                subscription: { include: { package: true } },
                _count: { select: { users: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                subscription: { include: { package: true } },
                _count: { select: { users: true } },
            },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async create(dto) {
        const pkg = await this.requirePackage(dto.packageSlug);
        const slug = await this.uniqueSlug(dto.name);
        return this.prisma.organization.create({
            data: {
                name: dto.name,
                slug,
                email: dto.email,
                phone: dto.phone,
                website: dto.website,
                maxUsers: pkg.maxUsers,
                subscription: {
                    create: { packageId: pkg.id, billingEmail: dto.email },
                },
            },
            include: { subscription: { include: { package: true } } },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.organization.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.organization.delete({ where: { id } });
        return { success: true };
    }
    async assignPackage(id, packageSlug) {
        await this.findOne(id);
        const pkg = await this.requirePackage(packageSlug);
        return this.prisma.subscription.upsert({
            where: { organizationId: id },
            create: { organizationId: id, packageId: pkg.id },
            update: { packageId: pkg.id, status: 'ACTIVE' },
            include: { package: true },
        });
    }
    async getCurrentOrg(organizationId) {
        if (!organizationId) {
            throw new common_1.BadRequestException('No organization context');
        }
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                subscription: {
                    include: {
                        package: { include: { modules: { include: { module: true } } } },
                    },
                },
            },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const sub = org.subscription;
        const modules = sub && ['ACTIVE', 'TRIALING'].includes(sub.status) && sub.package.isActive
            ? sub.package.modules
                .filter((pm) => pm.module.isActive)
                .map((pm) => pm.module.key)
            : [];
        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            email: org.email,
            phone: org.phone,
            website: org.website,
            isActive: org.isActive,
            maxUsers: org.maxUsers,
            createdAt: org.createdAt,
            subscription: sub
                ? {
                    status: sub.status,
                    packageName: sub.package.name,
                    billingCycle: sub.package.billingCycle,
                }
                : null,
            modules,
        };
    }
    async requirePackage(slug) {
        const pkg = await this.prisma.package.findFirst({
            where: { slug, isActive: true },
        });
        if (!pkg)
            throw new common_1.BadRequestException(`Unknown or inactive package: ${slug}`);
        return pkg;
    }
    async uniqueSlug(name) {
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
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map