"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.permissionsForRoles = permissionsForRoles;
const types_1 = require("@vyntra/types");
exports.ROLE_PERMISSIONS = {
    [types_1.Role.SUPER_ADMIN]: Object.values(types_1.Permission),
    [types_1.Role.ORG_ADMIN]: [
        types_1.Permission.CMS_CREATE_PAGE,
        types_1.Permission.CMS_EDIT_PAGE,
        types_1.Permission.CMS_DELETE_PAGE,
        types_1.Permission.CMS_PUBLISH_PAGE,
        types_1.Permission.CMS_MANAGE_MEDIA,
        types_1.Permission.CMS_MANAGE_COMMENTS,
        types_1.Permission.CRM_CREATE_LEAD,
        types_1.Permission.CRM_EDIT_LEAD,
        types_1.Permission.CRM_DELETE_LEAD,
        types_1.Permission.CRM_CREATE_CONTACT,
        types_1.Permission.CRM_EDIT_CONTACT,
        types_1.Permission.CRM_MANAGE_CAMPAIGNS,
        types_1.Permission.CRM_MANAGE_TASKS,
        types_1.Permission.CRM_VIEW_ACTIVITIES,
        types_1.Permission.ADMIN_MANAGE_USERS,
        types_1.Permission.ADMIN_MANAGE_ORGANIZATION,
        types_1.Permission.ADMIN_VIEW_ANALYTICS,
    ],
    [types_1.Role.EDITOR]: [
        types_1.Permission.CMS_CREATE_PAGE,
        types_1.Permission.CMS_EDIT_PAGE,
        types_1.Permission.CMS_PUBLISH_PAGE,
        types_1.Permission.CMS_MANAGE_MEDIA,
        types_1.Permission.CMS_MANAGE_COMMENTS,
        types_1.Permission.CRM_CREATE_LEAD,
        types_1.Permission.CRM_EDIT_LEAD,
        types_1.Permission.CRM_CREATE_CONTACT,
        types_1.Permission.CRM_EDIT_CONTACT,
        types_1.Permission.CRM_MANAGE_CAMPAIGNS,
        types_1.Permission.CRM_MANAGE_TASKS,
        types_1.Permission.CRM_VIEW_ACTIVITIES,
    ],
    [types_1.Role.USER]: [
        types_1.Permission.CRM_CREATE_LEAD,
        types_1.Permission.CRM_EDIT_LEAD,
        types_1.Permission.CRM_VIEW_ACTIVITIES,
    ],
    [types_1.Role.VIEWER]: [types_1.Permission.CRM_VIEW_ACTIVITIES],
};
function permissionsForRoles(roles) {
    const set = new Set();
    for (const role of roles) {
        for (const perm of exports.ROLE_PERMISSIONS[role] ?? [])
            set.add(perm);
    }
    return [...set];
}
//# sourceMappingURL=permissions.js.map