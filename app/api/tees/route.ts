import { NextResponse } from "next/server"
import { createSupabaseServerClient, teesTable } from "@/lib/supabase/server"
import { getRbacContext, requirePermission } from "@/lib/rbac"
import { TeesStudent } from "@/types/teesStudent"
import {
  hasTeesRequiredFields,
  mapTeesFromDatabase,
  mapTeesToDatabase,
  parseMissingColumnFromError,
  removeUnknownTeesColumns,
  sanitizeTeesPayload,
} from "@/utils/teesPayload"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { context, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !context) return errorResponse

  const permissionError = requirePermission(context, "read")
  if (permissionError) return permissionError

  let query = supabase.from(teesTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (context.organizationId) {
    query = query.eq("org", context.organizationId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    (data ?? []).map((student) => mapTeesFromDatabase(student)),
  )
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { context, errorResponse } = await getRbacContext(supabase)

  if (errorResponse || !context) return errorResponse

  const permissionError = requirePermission(context, "create")
  if (permissionError) return permissionError

  const allowNullImport =
    new URL(request.url).searchParams.get("allow_null_import") === "1"
  const payload = (await request.json()) as Partial<TeesStudent>
  let sanitizedPayload = mapTeesToDatabase(sanitizeTeesPayload(payload))

  if (context.organizationId) {
    sanitizedPayload.org = context.organizationId
  }

  if (!allowNullImport && !hasTeesRequiredFields(payload)) {
    return NextResponse.json(
      { error: "Student ID and Student Name (English) are required." },
      { status: 400 },
    )
  }

  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(teesTable)
      .insert(sanitizedPayload)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(mapTeesFromDatabase(data), { status: 201 })
    }

    const missingColumn = parseMissingColumnFromError(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    missingColumns.add(missingColumn)
    sanitizedPayload = removeUnknownTeesColumns(
      sanitizedPayload,
      missingColumns,
    )
  }

  return NextResponse.json(
    { error: "Failed to create TEE student after filtering unknown columns" },
    { status: 500 },
  )
}
