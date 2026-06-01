/** Platform-wide roles. SUPER_ADMIN is platform-level; the rest are org-scoped. */
export declare enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ORG_ADMIN = "ORG_ADMIN",
    EDITOR = "EDITOR",
    USER = "USER",
    VIEWER = "VIEWER"
}
/** Granular capabilities. Roles map to a set of these (see ROLE_PERMISSIONS in the API). */
export declare enum Permission {
    CMS_CREATE_PAGE = "CMS_CREATE_PAGE",
    CMS_EDIT_PAGE = "CMS_EDIT_PAGE",
    CMS_DELETE_PAGE = "CMS_DELETE_PAGE",
    CMS_PUBLISH_PAGE = "CMS_PUBLISH_PAGE",
    CMS_MANAGE_MEDIA = "CMS_MANAGE_MEDIA",
    CMS_MANAGE_COMMENTS = "CMS_MANAGE_COMMENTS",
    CRM_CREATE_LEAD = "CRM_CREATE_LEAD",
    CRM_EDIT_LEAD = "CRM_EDIT_LEAD",
    CRM_DELETE_LEAD = "CRM_DELETE_LEAD",
    CRM_CREATE_CONTACT = "CRM_CREATE_CONTACT",
    CRM_EDIT_CONTACT = "CRM_EDIT_CONTACT",
    CRM_MANAGE_CAMPAIGNS = "CRM_MANAGE_CAMPAIGNS",
    CRM_MANAGE_TASKS = "CRM_MANAGE_TASKS",
    CRM_VIEW_ACTIVITIES = "CRM_VIEW_ACTIVITIES",
    ADMIN_MANAGE_USERS = "ADMIN_MANAGE_USERS",
    ADMIN_MANAGE_ORGANIZATION = "ADMIN_MANAGE_ORGANIZATION",
    ADMIN_VIEW_ANALYTICS = "ADMIN_VIEW_ANALYTICS",
    SUPER_ADMIN_MANAGE_ORGANIZATIONS = "SUPER_ADMIN_MANAGE_ORGANIZATIONS",
    SUPER_ADMIN_MANAGE_ALL_USERS = "SUPER_ADMIN_MANAGE_ALL_USERS",
    SUPER_ADMIN_MANAGE_PACKAGES = "SUPER_ADMIN_MANAGE_PACKAGES",
    SUPER_ADMIN_VIEW_ALL_DATA = "SUPER_ADMIN_VIEW_ALL_DATA",
    SUPER_ADMIN_MANAGE_BILLING = "SUPER_ADMIN_MANAGE_BILLING"
}
/** Decoded JWT payload the API signs and the guards rely on. */
export interface JwtPayload {
    sub: string;
    email: string;
    organizationId: string | null;
    superAdmin: boolean;
    roles: Role[];
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
    organizationName?: string;
    packageSlug?: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
    superAdmin: boolean;
    organizationId?: string | null;
    roles: Role[];
}
export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}
