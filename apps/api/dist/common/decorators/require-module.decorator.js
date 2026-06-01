"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireModule = exports.REQUIRE_MODULE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRE_MODULE_KEY = 'requireModule';
const RequireModule = (module) => (0, common_1.SetMetadata)(exports.REQUIRE_MODULE_KEY, module);
exports.RequireModule = RequireModule;
//# sourceMappingURL=require-module.decorator.js.map