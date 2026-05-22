import { NextResponse } from "next/server"
import { requireSuperAdmin } from "./auth"
import {
  CreateUserAccountPayload,
  UserAccountPermissions,
  userAccountRoles,
} from "@/types/userAccount"
import {
  mapSupabaseUserToUserAccount,
  userAccountPermissionKeys,
} from "@/utils/userAccount"
import {
  listRiseUserProfiles,
  upsertRiseUserProfile,
} from "./rise-user"

export async function GET() {
  const { adminSupabase, errorResponse } = await requireSuperAdmin()
  if (errorResponse || !adminSupabase) {
    return errorResponse
  }

  const { data, error } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    const profilesByUserId = await listRiseUserProfiles(
      adminSupabase,
      data.users.map((user) => user.id),
    )

    return NextResponse.json(
      data.users.map((user) =>
        mapSupabaseUserToUserAccount(user, profilesByUserId.get(user.id)),
      ),
    )
  } catch (profileError) {
    const message =
      profileError instanceof Error
        ? profileError.message
        : "Failed to load rise_user profiles."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { adminSupabase, errorResponse } = await requireSuperAdmin()
  if (errorResponse || !adminSupabase) {
    return errorResponse
  }

  const payload = (await request.json()) as Partial<CreateUserAccountPayload>
  const email = payload.email?.trim().toLowerCase()
  const password = payload.password
  const role = payload.role
  const organizationId = payload.organizationId?.trim()
  const organizationTitle = payload.organizationTitle?.trim()
  const organizationScope =
    payload.organizationScope === "all" ? "all" : "organization"
  const canManageAllOrganizations = organizationScope === "all"
  const scopedOrganizationId = canManageAllOrganizations
    ? "all"
    : organizationId
  const scopedOrganizationTitle = canManageAllOrganizations
    ? "All Organizations"
    : organizationTitle
  const displayName = payload.displayName?.trim()

  if (!email || !password || !role || !scopedOrganizationId) {
    return NextResponse.json(
      { error: "Email, password, role, and organization access are required." },
      { status: 400 },
    )
  }

  if (!userAccountRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    )
  }

  const permissions = userAccountPermissionKeys.reduce<UserAccountPermissions>(
    (nextPermissions, permissionKey) => ({
      ...nextPermissions,
      [permissionKey]: Boolean(payload.permissions?.[permissionKey]),
    }),
    {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
  )

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role,
      organization_scope: organizationScope,
      organization_id: scopedOrganizationId,
      can_manage_organization: !canManageAllOrganizations,
      can_manage_all_organizations: canManageAllOrganizations,
      permissions,
    },
    user_metadata: {
      display_name: displayName || null,
      name: displayName || null,
      role,
      organization_scope: organizationScope,
      organization_id: scopedOrganizationId,
      organization_title: scopedOrganizationTitle || null,
      can_manage_organization: !canManageAllOrganizations,
      can_manage_all_organizations: canManageAllOrganizations,
      permissions,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    const profile = await upsertRiseUserProfile(adminSupabase, {
      userId: data.user.id,
      organizationId: scopedOrganizationId,
      organizationScope,
      permissions,
    })

    return NextResponse.json(mapSupabaseUserToUserAccount(data.user, profile), {
      status: 201,
    })
  } catch (profileError) {
    await adminSupabase.auth.admin.deleteUser(data.user.id)

    const message =
      profileError instanceof Error
        ? profileError.message
        : "Failed to link user to rise_user."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
