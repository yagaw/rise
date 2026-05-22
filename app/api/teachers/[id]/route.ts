import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  teachersTable,
} from "@/lib/supabase/server"
import { getRbacContext, requirePermission } from "@/lib/rbac"
import { Teacher } from "@/types/teacher"
import {
  extractMissingColumnFromError,
  mapTeacherFromDatabase,
  mapTeacherToDatabase,
  removeColumnFromPayload,
  sanitizeTeacherPayload,
} from "@/utils/teacherPayload"

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

  let query = supabase.from(teachersTable)
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

  return NextResponse.json(mapTeacherFromDatabase(data))
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "update")
  if (permissionError) return permissionError

  const payload = (await request.json()) as Partial<Teacher>
  let sanitizedPayload = mapTeacherToDatabase(sanitizeTeacherPayload(payload))

  if (rbacContext.organizationId) {
    sanitizedPayload.org = rbacContext.organizationId
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    let query = supabase.from(teachersTable)
      .update(sanitizedPayload)
      .eq("id", id)
      .select("*")

    if (rbacContext.organizationId) {
      query = query.eq("org", rbacContext.organizationId)
    }

    const { data, error } = await query
      .single()

    if (!error) {
      return NextResponse.json(mapTeacherFromDatabase(data))
    }

    const missingColumn = extractMissingColumnFromError(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    sanitizedPayload = removeColumnFromPayload(sanitizedPayload, missingColumn)
  }

  return NextResponse.json(
    { error: "Failed to update teacher after filtering unknown columns" },
    { status: 500 },
  )
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "delete")
  if (permissionError) return permissionError

  let query = supabase.from(teachersTable).delete().eq("id", id)

  if (rbacContext.organizationId) {
    query = query.eq("org", rbacContext.organizationId)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
