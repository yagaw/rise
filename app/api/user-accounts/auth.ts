import { NextResponse } from "next/server"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"

const superAdminRoles = new Set(["super_admin", "super-admin", "super admin"])

function isSuperAdminEmail(email?: string) {
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  return email ? superAdminEmails.includes(email.toLowerCase()) : false
}

function isSuperAdmin(user: {
  email?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const appRole = user.app_metadata?.role
  const userRole = user.user_metadata?.role
  const normalizedAppRole =
    typeof appRole === "string" ? appRole.trim().toLowerCase() : ""
  const normalizedUserRole =
    typeof userRole === "string" ? userRole.trim().toLowerCase() : ""

  return (
    superAdminRoles.has(normalizedAppRole) ||
    superAdminRoles.has(normalizedUserRole) ||
    isSuperAdminEmail(user.email)
  )
}

export async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient()
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

  if (!isSuperAdmin(user)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Only super admins can manage user accounts." },
        { status: 403 },
      ),
    }
  }

  try {
    return { adminSupabase: createSupabaseAdminClient() }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Missing Supabase admin config."

    return {
      errorResponse: NextResponse.json({ error: message }, { status: 500 }),
    }
  }
}
