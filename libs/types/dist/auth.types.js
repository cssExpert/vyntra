"use strict";
// Authentication & authorization contracts shared between the API and web app.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.Role = void 0;
/** Platform-wide roles. SUPER_ADMIN is platform-level; the rest are org-scoped. */
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ORG_ADMIN"] = "ORG_ADMIN";
    Role["EDITOR"] = "EDITOR";
    Role["USER"] = "USER";
    Role["VIEWER"] = "VIEWER";
})(Role || (exports.Role = Role = {}));
/** Granular capabilities. Roles map to a set of these (see ROLE_PERMISSIONS in the API). */
var Permission;
(function (Permission) {
    // CMS
    Permission["CMS_CREATE_PAGE"] = "CMS_CREATE_PAGE";
    Permission["CMS_EDIT_PAGE"] = "CMS_EDIT_PAGE";
    Permission["CMS_DELETE_PAGE"] = "CMS_DELETE_PAGE";
    Permission["CMS_PUBLISH_PAGE"] = "CMS_PUBLISH_PAGE";
    Permission["CMS_MANAGE_MEDIA"] = "CMS_MANAGE_MEDIA";
    Permission["CMS_MANAGE_COMMENTS"] = "CMS_MANAGE_COMMENTS";
    // CRM
    Permission["CRM_CREATE_LEAD"] = "CRM_CREATE_LEAD";
    Permission["CRM_EDIT_LEAD"] = "CRM_EDIT_LEAD";
    Permission["CRM_DELETE_LEAD"] = "CRM_DELETE_LEAD";
    Permission["CRM_CREATE_CONTACT"] = "CRM_CREATE_CONTACT";
    Permission["CRM_EDIT_CONTACT"] = "CRM_EDIT_CONTACT";
    Permission["CRM_MANAGE_CAMPAIGNS"] = "CRM_MANAGE_CAMPAIGNS";
    Permission["CRM_MANAGE_TASKS"] = "CRM_MANAGE_TASKS";
    Permission["CRM_VIEW_ACTIVITIES"] = "CRM_VIEW_ACTIVITIES";
    // Org admin
    Permission["ADMIN_MANAGE_USERS"] = "ADMIN_MANAGE_USERS";
    Permission["ADMIN_MANAGE_ORGANIZATION"] = "ADMIN_MANAGE_ORGANIZATION";
    Permission["ADMIN_VIEW_ANALYTICS"] = "ADMIN_VIEW_ANALYTICS";
    // Super admin
    Permission["SUPER_ADMIN_MANAGE_ORGANIZATIONS"] = "SUPER_ADMIN_MANAGE_ORGANIZATIONS";
    Permission["SUPER_ADMIN_MANAGE_ALL_USERS"] = "SUPER_ADMIN_MANAGE_ALL_USERS";
    Permission["SUPER_ADMIN_MANAGE_PACKAGES"] = "SUPER_ADMIN_MANAGE_PACKAGES";
    Permission["SUPER_ADMIN_VIEW_ALL_DATA"] = "SUPER_ADMIN_VIEW_ALL_DATA";
    Permission["SUPER_ADMIN_MANAGE_BILLING"] = "SUPER_ADMIN_MANAGE_BILLING";
})(Permission || (exports.Permission = Permission = {}));
