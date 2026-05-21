import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  dataTypeTable,
} from "@/lib/supabase/server"
import { DataType } from "@/types/dataType"
import {
  parseMissingDataTypeColumn,
  removeUnknownDataTypeColumns,
  sanitizeDataTypePayload,
} from "@/utils/dataTypePayload"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(dataTypeTable)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<DataType>
  let sanitizedPayload = sanitizeDataTypePayload(payload) as Record<
    string,
    unknown
  >

  if (!Object.keys(sanitizedPayload).length) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 },
    )
  }

  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(dataTypeTable)
      .update(sanitizedPayload)
      .eq("id", id)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data)
    }

    const missingColumn = parseMissingDataTypeColumn(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      const status = error.code === "PGRST116" ? 404 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    missingColumns.add(missingColumn)
    sanitizedPayload = removeUnknownDataTypeColumns(
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
    { error: "Failed to update Data Type after filtering unknown columns" },
    { status: 500 },
  )
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from(dataTypeTable).delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}