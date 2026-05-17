import { NextResponse } from "next/server"
import { createSupabaseServerClient, techerPositionTable } from "@/lib/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(techerPositionTable)
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
    .update({
      type_english: payload.type_english.trim(),
      type_short: payload.type_short?.trim() || null,
      type_myanmar: payload.type_myanmar?.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from(techerPositionTable)
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
