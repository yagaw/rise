import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getRbacContext } from "@/lib/rbac"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { context, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !context) return errorResponse

  return NextResponse.json({
    organizationId: context.organizationId,
    allOrganizations: !context.organizationId,
    permissions: context.permissions,
  })
}
