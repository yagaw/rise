import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  organizationsTable,
} from "@/lib/supabase/server"
import { Organization } from "@/types/organization"
import { sanitizeOrganizationPayload } from "@/utils/organizationPayload"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(organizationsTable)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<Organization>
  const sanitizedPayload = sanitizeOrganizationPayload(payload)

  const { data, error } = await supabase
    .from(organizationsTable)
    .update(sanitizedPayload)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from(organizationsTable)
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
