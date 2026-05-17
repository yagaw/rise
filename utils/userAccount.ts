import { User } from "@supabase/supabase-js"
import {
  UserAccount,
  UserAccountOrganizationScope,
  UserAccountPermissions,
  UserAccountRole,
  userAccountRoles,
} from "@/types/userAccount"

export const defaultUserAccountPermissions: UserAccountPermissions = {
  create: true,
  read: true,
  update: true,
  delete: true,
}

export const emptyUserAccountPermissions: UserAccountPermissions = {
  create: false,
  read: false,
  update: false,
  delete: false,
}

export const userAccountPermissionKeys = [
  "create",
  "read",
  "update",
  "delete",
] as const

const getMetadataValue = (
  metadata: Record<string, unknown>,
  key: string,
): string => {
  const value = metadata[key]
  return typeof value === "string" ? value : ""
}

const getMetadataBoolean = (
  metadata: Record<string, unknown>,
  key: string,
): boolean => metadata[key] === true

export const normalizeUserAccountPermissions = (
  permissions: unknown,
): UserAccountPermissions => {
  const permissionRecord =
    permissions && typeof permissions === "object"
      ? (permissions as Partial<Record<keyof UserAccountPermissions, unknown>>)
      : {}

  return userAccountPermissionKeys.reduce<UserAccountPermissions>(
    (nextPermissions, permissionKey) => ({
      ...nextPermissions,
      [permissionKey]: Boolean(permissionRecord[permissionKey]),
    }),
    { ...emptyUserAccountPermissions },
  )
}

export const mapSupabaseUserToUserAccount = (user: User): UserAccount => {
  const appMetadata = user.app_metadata || {}
  const userMetadata = user.user_metadata || {}
  const metadataRole =
    getMetadataValue(appMetadata, "role") ||
    getMetadataValue(userMetadata, "role")
  const role = userAccountRoles.includes(metadataRole as UserAccountRole)
    ? (metadataRole as UserAccountRole)
    : "CRED"
  const organizationId =
    getMetadataValue(appMetadata, "organization_id") ||
    getMetadataValue(userMetadata, "organization_id")
  const metadataOrganizationScope =
    getMetadataValue(appMetadata, "organization_scope") ||
    getMetadataValue(userMetadata, "organization_scope")
  const canManageAllOrganizations =
    getMetadataBoolean(appMetadata, "can_manage_all_organizations") ||
    getMetadataBoolean(userMetadata, "can_manage_all_organizations") ||
    metadataOrganizationScope === "all" ||
    organizationId === "all"
  const organizationScope: UserAccountOrganizationScope =
    canManageAllOrganizations ? "all" : "organization"

  return {
    id: user.id,
    email: user.email || "",
    displayName:
      getMetadataValue(userMetadata, "display_name") ||
      getMetadataValue(userMetadata, "name"),
    role,
    organizationScope,
    organizationId,
    organizationTitle: canManageAllOrganizations
      ? "All Organizations"
      : getMetadataValue(userMetadata, "organization_title"),
    canManageAllOrganizations,
    permissions: normalizeUserAccountPermissions(
      appMetadata.permissions || userMetadata.permissions,
    ),
    createdAt: user.created_at || null,
    lastSignInAt: user.last_sign_in_at || null,
  }
}
