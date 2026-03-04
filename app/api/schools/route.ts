import { NextResponse } from "next/server"
import { createSupabaseServerClient, schoolsTable } from "@/lib/supabase/server"
import { sanitizeSchoolPayload } from "@/utils/schoolPayload"
import { School } from "@/types/school"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(schoolsTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<School>
  const sanitizedPayload = sanitizeSchoolPayload(payload)

  const { data, error } = await supabase
    .from(schoolsTable)
    .insert(sanitizedPayload)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
