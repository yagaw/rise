import { NextResponse } from "next/server"
import { createSupabaseServerClient, teesTable } from "@/lib/supabase/server"
import { getRbacContext, requirePermission } from "@/lib/rbac"
import { TeesStudent } from "@/types/teesStudent"
import {
  mapTeesFromDatabase,
  mapTeesToDatabase,
  parseMissingColumnFromError,
  removeUnknownTeesColumns,
  sanitizeTeesPayload,
} from "@/utils/teesPayload"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "read")
  if (permissionError) return permissionError

  let query = supabase.from(teesTable)
    .select("*")
    .eq("id", id)

  if (rbacContext.organizationId) {
    query = query.eq("org", rbacContext.organizationId)
  }

  const { data, error } = await query
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(mapTeesFromDatabase(data))
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { context: rbacContext, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !rbacContext) return errorResponse

  const permissionError = requirePermission(rbacContext, "update")
  if (permissionError) return permissionError

  const payload = (await request.json()) as Partial<TeesStudent>
  let sanitizedPayload = mapTeesToDatabase(sanitizeTeesPayload(payload))

  if (rbacContext.organizationId) {
    sanitizedPayload.org = rbacContext.organizationId
  }

  if (!Object.keys(sanitizedPayload).length) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 },
    )
  }

  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    let query = supabase.from(teesTable)
      .update(sanitizedPayload)
      .eq("id", id)
      .select("*")

    if (rbacContext.organizationId) {
      query = query.eq("org", rbacContext.organizationId)
    }

    const { data, error } = await query
      .single()

    if (!error) {
      return NextResponse.json(mapTeesFromDatabase(data))
    }

    const missingColumn = parseMissingColumnFromError(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      const status = error.code === "PGRST116" ? 404 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    missingColumns.add(missingColumn)
    sanitizedPayload = removeUnknownTeesColumns(
      sanitizedPayload,
      missingColumns,
    )
    if (!Object.keys(sanitizedPayload).length) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      )
    }
  }

  return NextResponse.json(
    { error: "Failed to update TEE student after filtering unknown columns" },
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

  let query = supabase.from(teesTable).delete().eq("id", id)

  if (rbacContext.organizationId) {
    query = query.eq("org", rbacContext.organizationId)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
