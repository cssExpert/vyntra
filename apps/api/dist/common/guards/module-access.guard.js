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
exports.ModuleAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const require_module_decorator_1 = require("../decorators/require-module.decorator");
let ModuleAccessGuard = class ModuleAccessGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const required = this.reflector.getAllAndOverride(require_module_decorator_1.REQUIRE_MODULE_KEY, [context.getHandler(), context.getClass()]);
        if (!required)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            throw new common_1.ForbiddenException('Not authenticated');
        if (user.superAdmin)
            return true;
        if (!user.organizationId) {
            throw new common_1.ForbiddenException('No organization context');
        }
        const subscription = await this.prisma.subscription.findUnique({
            where: { organizationId: user.organizationId },
            include: { package: { include: { modules: { include: { module: true } } } } },
        });
        const active = subscription &&
            ['ACTIVE', 'TRIALING'].includes(subscription.status) &&
            subscription.package.isActive;
        const hasModule = active &&
            subscription.package.modules.some((pm) => pm.module.key === required && pm.module.isActive);
        if (!hasModule) {
            throw new common_1.ForbiddenException(`Your plan does not include the ${required} module`);
        }
        return true;
    }
};
exports.ModuleAccessGuard = ModuleAccessGuard;
exports.ModuleAccessGuard = ModuleAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ModuleAccessGuard);
//# sourceMappingURL=module-access.guard.js.map