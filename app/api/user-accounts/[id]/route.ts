import { NextResponse } from "next/server"
import { requireSuperAdmin } from "../auth"
import { UpdateUserAccountPayload } from "@/types/userAccount"
import {
  mapSupabaseUserToUserAccount,
  normalizeUserAccountPermissions,
} from "@/utils/userAccount"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const { adminSupabase, errorResponse } = await requireSuperAdmin()
  if (errorResponse || !adminSupabase) {
    return errorResponse
  }

  const { data, error } = await adminSupabase.auth.admin.getUserById(id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapSupabaseUserToUserAccount(data.user))
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const { adminSupabase, errorResponse } = await requireSuperAdmin()
  if (errorResponse || !adminSupabase) {
    return errorResponse
  }

  const payload = (await request.json()) as Partial<UpdateUserAccountPayload>
  const email = payload.email?.trim().toLowerCase()
  const organizationScope =
    payload.organizationScope === "all" ? "all" : "organization"
  const canManageAllOrganizations = organizationScope === "all"
  const organizationId = canManageAllOrganizations
    ? "all"
    : payload.organizationId?.trim()
  const organizationTitle = canManageAllOrganizations
    ? "All Organizations"
    : payload.organizationTitle?.trim()
  const displayName = payload.displayName?.trim()

  if (!email || !organizationId) {
    return NextResponse.json(
      { error: "Email and organization access are required." },
      { status: 400 },
    )
  }

  const permissions = normalizeUserAccountPermissions(payload.permissions)

  const { data, error } = await adminSupabase.auth.admin.updateUserById(id, {
    email,
    app_metadata: {
      role: "CRED",
      organization_scope: organizationScope,
      organization_id: organizationId,
      can_manage_organization: !canManageAllOrganizations,
      can_manage_all_organizations: canManageAllOrganizations,
      permissions,
    },
    user_metadata: {
      display_name: displayName || null,
      name: displayName || null,
      role: "CRED",
      organization_scope: organizationScope,
      organization_id: organizationId,
      organization_title: organizationTitle || null,
      can_manage_organization: !canManageAllOrganizations,
      can_manage_all_organizations: canManageAllOrganizations,
      permissions,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapSupabaseUserToUserAccount(data.user))
}
