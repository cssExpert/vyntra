import { Permission, Role } from '@vyntra/types';

/**
 * Static role → permission matrix. Roles are stored in the DB; the granular
 * permissions they imply live here in code (sufficient for the MVP — can be
 * promoted to a DB-backed ACL later without changing call sites).
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),

  [Role.ORG_ADMIN]: [
    Permission.CMS_CREATE_PAGE,
    Permission.CMS_EDIT_PAGE,
    Permission.CMS_DELETE_PAGE,
    Permission.CMS_PUBLISH_PAGE,
    Permission.CMS_MANAGE_MEDIA,
    Permission.CMS_MANAGE_COMMENTS,
    Permission.CRM_CREATE_LEAD,
    Permission.CRM_EDIT_LEAD,
    Permission.CRM_DELETE_LEAD,
    Permission.CRM_CREATE_CONTACT,
    Permission.CRM_EDIT_CONTACT,
    Permission.CRM_MANAGE_CAMPAIGNS,
    Permission.CRM_MANAGE_TASKS,
    Permission.CRM_VIEW_ACTIVITIES,
    Permission.ADMIN_MANAGE_USERS,
    Permission.ADMIN_MANAGE_ORGANIZATION,
    Permission.ADMIN_VIEW_ANALYTICS,
  ],

  [Role.EDITOR]: [
    Permission.CMS_CREATE_PAGE,
    Permission.CMS_EDIT_PAGE,
    Permission.CMS_PUBLISH_PAGE,
    Permission.CMS_MANAGE_MEDIA,
    Permission.CMS_MANAGE_COMMENTS,
    Permission.CRM_CREATE_LEAD,
    Permission.CRM_EDIT_LEAD,
    Permission.CRM_CREATE_CONTACT,
    Permission.CRM_EDIT_CONTACT,
    Permission.CRM_MANAGE_CAMPAIGNS,
    Permission.CRM_MANAGE_TASKS,
    Permission.CRM_VIEW_ACTIVITIES,
  ],

  [Role.USER]: [
    Permission.CRM_CREATE_LEAD,
    Permission.CRM_EDIT_LEAD,
    Permission.CRM_VIEW_ACTIVITIES,
  ],

  [Role.VIEWER]: [Permission.CRM_VIEW_ACTIVITIES],
};

/** Resolve the union of permissions for a set of roles. */
export function permissionsForRoles(roles: Role[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role] ?? []) set.add(perm);
  }
  return [...set];
}
