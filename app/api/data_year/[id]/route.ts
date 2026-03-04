import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  dataYearTable,
} from "@/lib/supabase/server"
import { DataYear } from "@/types/dataYear"
import {
  parseMissingDataYearColumn,
  removeUnknownDataYearColumns,
  sanitizeDataYearPayload,
} from "@/utils/dataYearPayload"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(dataYearTable)
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
  const payload = (await request.json()) as Partial<DataYear>
  let sanitizedPayload = sanitizeDataYearPayload(payload) as Record<
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
      .from(dataYearTable)
      .update(sanitizedPayload)
      .eq("id", id)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data)
    }

    const missingColumn = parseMissingDataYearColumn(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      const status = error.code === "PGRST116" ? 404 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    missingColumns.add(missingColumn)
    sanitizedPayload = removeUnknownDataYearColumns(
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
    { error: "Failed to update Data Year after filtering unknown columns" },
    { status: 500 },
  )
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from(dataYearTable).delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
