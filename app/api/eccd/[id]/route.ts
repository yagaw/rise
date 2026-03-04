import { NextResponse } from "next/server"
import { createSupabaseServerClient, eccdTable } from "@/lib/supabase/server"
import {
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

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from(eccdTable)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json(
      { error: normalizeErrorMessage(error) },
      { status },
    )
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const body = (await request.json()) as Partial<EccdStudent>
  let payload = sanitizeEccdPayload(body)

  if (!Object.keys(payload).length) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const missingColumns = new Set<string>()

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(eccdTable)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data)
    }

    const missing = parseMissingColumnFromError(error.message)
    if (!missing || missingColumns.has(missing)) {
      const status = error.code === "PGRST116" ? 404 : 500
      return NextResponse.json(
        { error: normalizeErrorMessage(error) },
        { status },
      )
    }

    missingColumns.add(missing)
    payload = removeUnknownEccdColumns(payload, missingColumns)
    if (!Object.keys(payload).length) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      )
    }
  }

  return NextResponse.json(
    { error: "Unable to update ECCD student due to schema mismatch." },
    { status: 500 },
  )
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from(eccdTable).delete().eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: normalizeErrorMessage(error) },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
