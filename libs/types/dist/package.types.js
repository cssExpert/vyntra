"use strict";
// Packages (plans) and the modules they entitle a company to use.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCycle = exports.ModuleKey = void 0;
/** Known platform modules. Stored in the DB so new ones can be added without code changes,
 *  but these keys are the contract the frontend gates navigation on. */
var ModuleKey;
(function (ModuleKey) {
    ModuleKey["CMS"] = "CMS";
    ModuleKey["CRM"] = "CRM";
})(ModuleKey || (exports.ModuleKey = ModuleKey = {}));
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["MONTHLY"] = "MONTHLY";
    BillingCycle["YEARLY"] = "YEARLY";
    BillingCycle["LIFETIME"] = "LIFETIME";
})(BillingCycle || (exports.BillingCycle = BillingCycle = {}));
