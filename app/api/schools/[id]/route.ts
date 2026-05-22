import { NextResponse } from "next/server"
import { createSupabaseServerClient, schoolsTable } from "@/lib/supabase/server"
import { getRbacContext, requirePermission } from "@/lib/rbac"
import { sanitizeSchoolPayload } from "@/utils/schoolPayload"
import { School } from "@/types/school"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "read")
  if (permissionError) return permissionError

  let query = supabase.from(schoolsTable)
    .select("*")
    .eq("id", id)

  if (rbacContext.organizationId) {
    query = query.eq("org", rbacContext.organizationId)
  }

  const { data, error } = await query
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "update")
  if (permissionError) return permissionError

  const payload = (await request.json()) as Partial<School>
  const sanitizedPayload = sanitizeSchoolPayload(payload)

  if (rbacContext.organizationId) {
    sanitizedPayload.org = rbacContext.organizationId
  }

  let query = supabase.from(schoolsTable)
    .update(sanitizedPayload)
    .eq("id", id)
    .select("*")

  if (rbacContext.organizationId) {
    query = query.eq("org", rbacContext.organizationId)
  }

  const { data, error } = await query
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "delete")
  if (permissionError) return permissionError

  let query = supabase.from(schoolsTable).delete().eq("id", id)

  if (rbacContext.organizationId) {
    query = query.eq("org", rbacContext.organizationId)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
