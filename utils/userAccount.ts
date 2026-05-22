import { User } from "@supabase/supabase-js"
import {
  RiseUserProfile,
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

const getRecordValue = (
  record: Record<string, unknown> | null | undefined,
  key: string,
) => record?.[key]

const getRecordString = (
  record: Record<string, unknown> | null | undefined,
  key: string,
): string => {
  const value = getRecordValue(record, key)
  return value === null || value === undefined ? "" : String(value)
}

const getOptionalBoolean = (
  record: Record<string, unknown> | null | undefined,
  key: string,
): boolean | undefined => {
  const value = getRecordValue(record, key)

  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "1", "yes", "y"].includes(normalized)) return true
    if (["false", "0", "no", "n"].includes(normalized)) return false
  }

  return undefined
}

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

const normalizeRiseUserPermissions = (
  riseUserProfile?: RiseUserProfile | null,
): UserAccountPermissions | null => {
  if (!riseUserProfile) return null

  const permissions =
    riseUserProfile.permissions && typeof riseUserProfile.permissions === "object"
      ? (riseUserProfile.permissions as Partial<
          Record<keyof UserAccountPermissions, unknown>
        >)
      : {}
  const hasPermissionColumns = [
    "can_create",
    "can_read",
    "can_update",
    "can_delete",
    "create",
    "read",
    "update",
    "delete",
  ].some((key) => Object.prototype.hasOwnProperty.call(riseUserProfile, key))
  const hasPermissionsJson =
    riseUserProfile.permissions !== null &&
    riseUserProfile.permissions !== undefined

  if (!hasPermissionColumns && !hasPermissionsJson) {
    return null
  }

  return {
    create:
      getOptionalBoolean(riseUserProfile, "can_create") ??
      getOptionalBoolean(riseUserProfile, "create") ??
      Boolean(permissions.create),
    read:
      getOptionalBoolean(riseUserProfile, "can_read") ??
      getOptionalBoolean(riseUserProfile, "read") ??
      Boolean(permissions.read),
    update:
      getOptionalBoolean(riseUserProfile, "can_update") ??
      getOptionalBoolean(riseUserProfile, "update") ??
      Boolean(permissions.update),
    delete:
      getOptionalBoolean(riseUserProfile, "can_delete") ??
      getOptionalBoolean(riseUserProfile, "delete") ??
      Boolean(permissions.delete),
  }
}

export const mapSupabaseUserToUserAccount = (
  user: User,
  riseUserProfile?: RiseUserProfile | null,
): UserAccount => {
  const appMetadata = user.app_metadata || {}
  const userMetadata = user.user_metadata || {}
  const metadataRole =
    getMetadataValue(appMetadata, "role") ||
    getMetadataValue(userMetadata, "role")
  const role = userAccountRoles.includes(metadataRole as UserAccountRole)
    ? (metadataRole as UserAccountRole)
    : "CRED"
  const organizationId =
    getRecordString(riseUserProfile, "organization_id") ||
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
    permissions:
      normalizeRiseUserPermissions(riseUserProfile) ??
      normalizeUserAccountPermissions(
        appMetadata.permissions || userMetadata.permissions,
      ),
    createdAt: user.created_at || null,
    lastSignInAt: user.last_sign_in_at || null,
  }
}
