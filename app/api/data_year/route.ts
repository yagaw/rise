import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  dataYearTable,
} from "@/lib/supabase/server"
import { DataYear } from "@/types/dataYear"
import {
  hasDataYearRequiredFields,
  parseMissingDataYearColumn,
  removeUnknownDataYearColumns,
  sanitizeDataYearPayload,
} from "@/utils/dataYearPayload"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(dataYearTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<DataYear>
  let sanitizedPayload = sanitizeDataYearPayload(payload) as Record<
    string,
    unknown
  >

  if (!hasDataYearRequiredFields(payload)) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 })
  }

  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(dataYearTable)
      .insert(sanitizedPayload)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data, { status: 201 })
    }

    const missingColumn = parseMissingDataYearColumn(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    missingColumns.add(missingColumn)
    sanitizedPayload = removeUnknownDataYearColumns(
      sanitizedPayload,
      missingColumns,
    )
  }

  return NextResponse.json(
    { error: "Failed to create Data Year after filtering unknown columns" },
    { status: 500 },
  )
}
