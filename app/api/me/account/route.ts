import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getRbacContext } from "@/lib/rbac"

const getMetadataString = (
  metadata: Record<string, unknown>,
  key: string,
) => {
  const value = metadata[key]
  return typeof value === "string" ? value : ""
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    )
  }

  const { context, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !context) return errorResponse

  const metadata = user.user_metadata ?? {}
  const appMetadata = user.app_metadata ?? {}
  const displayName =
    getMetadataString(metadata, "display_name") ||
    getMetadataString(metadata, "name")
  const organizationTitle =
    context.organizationId ||
    getMetadataString(metadata, "organization_title") ||
    getMetadataString(appMetadata, "organization_title") ||
    "All Organizations"

  return NextResponse.json({
    id: user.id,
    email: user.email || "",
    displayName,
    role: "CRED",
    organizationScope: context.organizationId ? "organization" : "all",
    organizationId: context.organizationId || "all",
    organizationTitle,
    canManageAllOrganizations: !context.organizationId,
    permissions: context.permissions,
    createdAt: user.created_at || null,
    lastSignInAt: user.last_sign_in_at || null,
  })
}
