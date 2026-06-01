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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_decorator_1 = require("../common/decorators/super-admin.decorator");
const users_service_1 = require("./users.service");
let AdminUsersController = class AdminUsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    listAll() {
        return this.usersService.listAll();
    }
    promote(id) {
        return this.usersService.promoteToSuperAdmin(id);
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminUsersController.prototype, "listAll", null);
__decorate([
    (0, common_1.Put)(':id/promote'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminUsersController.prototype, "promote", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, super_admin_decorator_1.SuperAdminOnly)(),
    (0, common_1.Controller)('admin/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map