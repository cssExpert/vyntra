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
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ModulesService = class ModulesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.module.findMany({ orderBy: { key: 'asc' } });
    }
    async findOne(id) {
        const mod = await this.prisma.module.findUnique({ where: { id } });
        if (!mod)
            throw new common_1.NotFoundException('Module not found');
        return mod;
    }
    async create(dto) {
        const key = dto.key.trim().toUpperCase();
        const existing = await this.prisma.module.findUnique({ where: { key } });
        if (existing)
            throw new common_1.ConflictException('Module key already exists');
        return this.prisma.module.create({
            data: { key, name: dto.name, description: dto.description },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.module.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.module.delete({ where: { id } });
        return { success: true };
    }
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map