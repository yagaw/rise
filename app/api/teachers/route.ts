import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  teachersTable,
} from "@/lib/supabase/server"
import { Teacher } from "@/types/teacher"
import {
  extractMissingColumnFromError,
  mapTeacherFromDatabase,
  mapTeacherToDatabase,
  removeColumnFromPayload,
  sanitizeTeacherPayload,
} from "@/utils/teacherPayload"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(teachersTable)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    (data ?? []).map((teacher) => mapTeacherFromDatabase(teacher)),
  )
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<Teacher>
  let sanitizedPayload = mapTeacherToDatabase(sanitizeTeacherPayload(payload))

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(teachersTable)
      .insert(sanitizedPayload)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(mapTeacherFromDatabase(data), { status: 201 })
    }

    const missingColumn = extractMissingColumnFromError(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    sanitizedPayload = removeColumnFromPayload(sanitizedPayload, missingColumn)
  }

  return NextResponse.json(
    { error: "Failed to create teacher after filtering unknown columns" },
    { status: 500 },
  )
}
