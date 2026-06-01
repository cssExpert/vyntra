import { SetMetadata } from '@nestjs/common';
import { ModuleKey } from '@vyntra/types';

export const REQUIRE_MODULE_KEY = 'requireModule';

/**
 * Require the current organization's package to include a given module
 * (enforced by ModuleAccessGuard). Used to gate CMS/CRM endpoints.
 */
export const RequireModule = (module: ModuleKey) =>
  SetMetadata(REQUIRE_MODULE_KEY, module);
