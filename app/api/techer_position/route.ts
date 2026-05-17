import { NextResponse } from "next/server"
import { createSupabaseServerClient, techerPositionTable } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(techerPositionTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as {
    type_english?: string
    type_short?: string
    type_myanmar?: string
  }

  if (!payload.type_english?.trim()) {
    return NextResponse.json({ error: "Type (English) is required." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from(techerPositionTable)
    .insert({
      type_english: payload.type_english.trim(),
      type_short: payload.type_short?.trim() || null,
      type_myanmar: payload.type_myanmar?.trim() || null,
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
