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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackagesController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const super_admin_decorator_1 = require("../common/decorators/super-admin.decorator");
const package_dto_1 = require("./dto/package.dto");
const packages_service_1 = require("./packages.service");
let PackagesController = class PackagesController {
    constructor(packagesService) {
        this.packagesService = packagesService;
    }
    findPublic() {
        return this.packagesService.findPublic();
    }
    findAll() {
        return this.packagesService.findAll();
    }
    findOne(id) {
        return this.packagesService.findOne(id);
    }
    create(dto) {
        return this.packagesService.create(dto);
    }
    update(id, dto) {
        return this.packagesService.update(id, dto);
    }
    remove(id) {
        return this.packagesService.remove(id);
    }
};
exports.PackagesController = PackagesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findPublic", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Get)('admin/packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findAll", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Get)('admin/packages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "findOne", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Post)('admin/packages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [package_dto_1.CreatePackageDto]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "create", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Patch)('admin/packages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, package_dto_1.UpdatePackageDto]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "update", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Delete)('admin/packages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackagesController.prototype, "remove", null);
exports.PackagesController = PackagesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [packages_service_1.PackagesService])
], PackagesController);
//# sourceMappingURL=packages.controller.js.map