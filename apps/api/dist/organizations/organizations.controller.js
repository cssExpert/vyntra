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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const current_org_decorator_1 = require("../common/decorators/current-org.decorator");
const super_admin_decorator_1 = require("../common/decorators/super-admin.decorator");
const organization_dto_1 = require("./dto/organization.dto");
const organizations_service_1 = require("./organizations.service");
let OrganizationsController = class OrganizationsController {
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    getMyOrg(organizationId) {
        return this.organizationsService.getCurrentOrg(organizationId);
    }
    findAll() {
        return this.organizationsService.findAll();
    }
    findOne(id) {
        return this.organizationsService.findOne(id);
    }
    create(dto) {
        return this.organizationsService.create(dto);
    }
    update(id, dto) {
        return this.organizationsService.update(id, dto);
    }
    remove(id) {
        return this.organizationsService.remove(id);
    }
    assignPackage(id, dto) {
        return this.organizationsService.assignPackage(id, dto.packageSlug);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Get)('organizations/me'),
    __param(0, (0, current_org_decorator_1.CurrentOrg)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "getMyOrg", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Get)('admin/organizations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Get)('admin/organizations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Post)('admin/organizations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [organization_dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Patch)('admin/organizations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organization_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Delete)('admin/organizations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "remove", null);
__decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Put)('admin/organizations/:id/package'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organization_dto_1.AssignPackageDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "assignPackage", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map