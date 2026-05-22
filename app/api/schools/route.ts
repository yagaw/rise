import { NextResponse } from "next/server"
import { createSupabaseServerClient, schoolsTable } from "@/lib/supabase/server"
import { getRbacContext, requirePermission } from "@/lib/rbac"
import { sanitizeSchoolPayload } from "@/utils/schoolPayload"
import { School } from "@/types/school"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { context, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !context) return errorResponse

  const permissionError = requirePermission(context, "read")
  if (permissionError) return permissionError

  let query = supabase.from(schoolsTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (context.organizationId) {
    query = query.eq("org", context.organizationId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { context, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !context) return errorResponse

  const permissionError = requirePermission(context, "create")
  if (permissionError) return permissionError

  const payload = (await request.json()) as Partial<School>
  const sanitizedPayload = sanitizeSchoolPayload(payload)

  if (context.organizationId) {
    sanitizedPayload.org = context.organizationId
  }

  const { data, error } = await supabase
    .from(schoolsTable)
    .insert(sanitizedPayload)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
