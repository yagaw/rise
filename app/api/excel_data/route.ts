import { NextResponse } from "next/server"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"

const EXCEL_TABLE = "excel_data"

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return Boolean(user)
}

export async function GET(request: Request) {
  if (!(await requireUser())) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    )
  }

  const searchParams = new URL(request.url).searchParams
  const dataYear = searchParams.get("data_year")?.trim()
  const dataType = searchParams.get("data_type")?.trim()
  const search = searchParams.get("search")?.trim()
  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from(EXCEL_TABLE)
    .select("*")
    .order("created_at", { ascending: false })

  if (dataYear) {
    query = query.eq("data_year", dataYear)
  }

  if (dataType) {
    query = query.eq("data_type", dataType)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: `Failed to load Excel data: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json(data ?? [])
}
