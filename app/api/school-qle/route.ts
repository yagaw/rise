import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  schoolQleTable,
} from "@/lib/supabase/server"
import { SchoolQle } from "@/types/schoolQle"
import {
  extractMissingColumnFromError,
  removeColumnFromPayload,
  sanitizeSchoolQlePayload,
} from "@/utils/schoolQlePayload"

const getQleErrorResponse = (error: { message: string; code?: string }) => {
  const message = error.message || "Unknown database error"
  const lowerMessage = message.toLowerCase()
  const isRlsError =
    error.code === "42501" ||
    lowerMessage.includes("row-level security policy") ||
    lowerMessage.includes("permission denied")

  if (isRlsError) {
    return NextResponse.json(
      {
        error:
          "RLS blocked this request on qle_ease. Add INSERT/SELECT/UPDATE/DELETE policies for your active role (anon/authenticated) in Supabase.",
      },
      { status: 403 },
    )
  }

  return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(schoolQleTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return getQleErrorResponse(error)
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<SchoolQle>
  let sanitizedPayload = sanitizeSchoolQlePayload(payload)

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(schoolQleTable)
      .insert(sanitizedPayload)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(data, { status: 201 })
    }

    const missingColumn = extractMissingColumnFromError(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return getQleErrorResponse(error)
    }

    sanitizedPayload = removeColumnFromPayload(sanitizedPayload, missingColumn)
  }

  return NextResponse.json(
    { error: "Failed to create School QLE after filtering unknown columns" },
    { status: 500 },
  )
}
