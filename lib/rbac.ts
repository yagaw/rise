import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseAdminClient, riseUserTable } from "@/lib/supabase/server"
import type { RiseUserProfile, UserAccountPermissions } from "@/types/userAccount"
import {
  emptyUserAccountPermissions,
  normalizeUserAccountPermissions,
} from "@/utils/userAccount"

export type CrudAction = keyof UserAccountPermissions

export type RbacContext = {
  userId: string
  organizationId: string | null
  permissions: UserAccountPermissions
}

const fullPermissions: UserAccountPermissions = {
  create: true,
  read: true,
  update: true,
  delete: true,
}

const getOptionalBoolean = (
  record: Record<string, unknown>,
  key: string,
): boolean | undefined => {
  const value = record[key]

  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "1", "yes", "y", "t", "on"].includes(normalized)) return true
    if (["false", "0", "no", "n", "f", "off"].includes(normalized)) return false
  }

  return undefined
}

const normalizeRiseUserPermissions = (
  profile: RiseUserProfile,
): UserAccountPermissions => {
  const permissions =
    profile.permissions && typeof profile.permissions === "object"
      ? normalizeUserAccountPermissions(profile.permissions)
      : { ...emptyUserAccountPermissions }
  const resolvePermission = (
    canKey: string,
    legacyKey: string,
    jsonValue: boolean,
  ) => {
    const values = [
      getOptionalBoolean(profile, canKey),
      getOptionalBoolean(profile, legacyKey),
      jsonValue,
    ]

    if (values.some((value) => value === true)) return true
    if (values.some((value) => value === false)) return false
    return false
  }

  return {
    create: resolvePermission("can_create", "create", permissions.create),
    read: resolvePermission("can_read", "read", permissions.read),
    update: resolvePermission("can_update", "update", permissions.update),
    delete: resolvePermission("can_delete", "delete", permissions.delete),
  }
}

export async function getRbacContext(supabase: SupabaseClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    }
  }

  const adminSupabase = createSupabaseAdminClient()
  const { data, error } = await adminSupabase
    .from(riseUserTable)
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    return {
      errorResponse: NextResponse.json(
        { error: `Failed to load access profile: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!data) {
    const metadata = {
      ...(user.user_metadata ?? {}),
      ...(user.app_metadata ?? {}),
    }
    const metadataOrganizationId =
      typeof metadata.organization_id === "string"
        ? metadata.organization_id.trim()
        : ""
    const metadataScope =
      typeof metadata.organization_scope === "string"
        ? metadata.organization_scope.trim().toLowerCase()
        : ""
    const canManageAllOrganizations =
      metadata.can_manage_all_organizations === true ||
      metadataScope === "all" ||
      metadataOrganizationId === "all"
    const metadataPermissions = normalizeUserAccountPermissions(
      metadata.permissions,
    )
    const hasMetadataPermissions =
      metadata.permissions !== null && metadata.permissions !== undefined

    if (canManageAllOrganizations || metadataOrganizationId) {
      return {
        context: {
          userId: user.id,
          organizationId: canManageAllOrganizations
            ? null
            : metadataOrganizationId || null,
          permissions: hasMetadataPermissions
            ? metadataPermissions
            : fullPermissions,
        } satisfies RbacContext,
      }
    }

    return {
      context: {
        userId: user.id,
        organizationId: null,
        permissions: fullPermissions,
      } satisfies RbacContext,
    }
  }

  const profile = data as RiseUserProfile
  const organizationId =
    profile.organization_id === null || profile.organization_id === undefined
      ? null
      : String(profile.organization_id).trim() || null

  return {
    context: {
      userId: user.id,
      organizationId,
      permissions: normalizeRiseUserPermissions(profile),
    } satisfies RbacContext,
  }
}

export function requirePermission(context: RbacContext, action: CrudAction) {
  if (context.permissions[action]) return null

  return NextResponse.json(
    { error: `You do not have ${action} permission.` },
    { status: 403 },
  )
}

export function filterRowsByOrganization<T extends Record<string, unknown>>(
  rows: T[],
  organizationId: string | null,
) {
  if (!organizationId) return rows

  return rows.filter((row) => {
    const value = row.org ?? row.organization ?? row.organisation
    return value !== null && value !== undefined && String(value) === organizationId
  })
}
