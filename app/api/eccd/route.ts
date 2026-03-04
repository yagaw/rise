import { NextResponse } from "next/server"
import { createSupabaseServerClient, eccdTable } from "@/lib/supabase/server"
import {
  hasEccdRequiredFields,
  parseMissingColumnFromError,
  removeUnknownEccdColumns,
  sanitizeEccdPayload,
} from "@/utils/eccdPayload"
import type { EccdStudent } from "@/types/eccdStudent"

const normalizeErrorMessage = (
  error: { message?: string; code?: string } | null,
) => {
  if (!error) return "Unknown Supabase error"
  const text = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase()
  if (error.code === "42501" || text.includes("row-level security")) {
    return "Permission denied by Row Level Security. Add a policy for this table in Supabase."
  }
  return error.message ?? "Unknown Supabase error"
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from(eccdTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: normalizeErrorMessage(error) },
      { status: 500 },
    )
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<EccdStudent>
  let payload = sanitizeEccdPayload(body)

  if (!hasEccdRequiredFields(payload)) {
    return NextResponse.json(
      { error: "Student ID and Student Name (English) are required." },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(eccdTable)
      .insert(payload)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data, { status: 201 })
    }

    const missing = parseMissingColumnFromError(error.message)
    if (!missing || missingColumns.has(missing)) {
      return NextResponse.json(
        { error: normalizeErrorMessage(error) },
        { status: 500 },
      )
    }

    missingColumns.add(missing)
    payload = removeUnknownEccdColumns(payload, missingColumns)
  }

  return NextResponse.json(
    { error: "Unable to create ECCD student due to schema mismatch." },
    { status: 500 },
  )
}
