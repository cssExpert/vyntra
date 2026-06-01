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
exports.ModulesController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_decorator_1 = require("../common/decorators/super-admin.decorator");
const module_dto_1 = require("./dto/module.dto");
const modules_service_1 = require("./modules.service");
let ModulesController = class ModulesController {
    constructor(modulesService) {
        this.modulesService = modulesService;
    }
    findAll() {
        return this.modulesService.findAll();
    }
    findOne(id) {
        return this.modulesService.findOne(id);
    }
    create(dto) {
        return this.modulesService.create(dto);
    }
    update(id, dto) {
        return this.modulesService.update(id, dto);
    }
    remove(id) {
        return this.modulesService.remove(id);
    }
};
exports.ModulesController = ModulesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "findOne", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [module_dto_1.CreateModuleDto]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "create", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, module_dto_1.UpdateModuleDto]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "update", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModulesController.prototype, "remove", null);
exports.ModulesController = ModulesController = __decorate([
    (0, common_1.Controller)('admin/modules'),
    __metadata("design:paramtypes", [modules_service_1.ModulesService])
], ModulesController);
//# sourceMappingURL=modules.controller.js.map