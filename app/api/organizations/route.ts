import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  organizationsTable,
} from "@/lib/supabase/server"
import { Organization } from "@/types/organization"
import { sanitizeOrganizationPayload } from "@/utils/organizationPayload"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(organizationsTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<Organization>
  const sanitizedPayload = sanitizeOrganizationPayload(payload, {
    includeSystemFields: true,
  })

  const { data, error } = await supabase
    .from(organizationsTable)
    .insert(sanitizedPayload)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
