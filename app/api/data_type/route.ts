import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  dataTypeTable,
} from "@/lib/supabase/server"
import { DataType } from "@/types/dataType"
import {
  hasDataTypeRequiredFields,
  parseMissingDataTypeColumn,
  removeUnknownDataTypeColumns,
  sanitizeDataTypePayload,
} from "@/utils/dataTypePayload"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(dataTypeTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<DataType>
  let sanitizedPayload = sanitizeDataTypePayload(payload) as Record<
    string,
    unknown
  >

  if (!hasDataTypeRequiredFields(payload)) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 })
  }

  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(dataTypeTable)
      .insert(sanitizedPayload)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data, { status: 201 })
    }

    const missingColumn = parseMissingDataTypeColumn(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    missingColumns.add(missingColumn)
    sanitizedPayload = removeUnknownDataTypeColumns(
      sanitizedPayload,
      missingColumns,
    )
  }

  return NextResponse.json(
    { error: "Failed to create Data Type after filtering unknown columns" },
    { status: 500 },
  )
}