"use strict";
// Organizations (tenants/companies) and their subscriptions.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = void 0;
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["TRIALING"] = "TRIALING";
    SubscriptionStatus["PAUSED"] = "PAUSED";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
