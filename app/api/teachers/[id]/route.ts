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

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from(teachersTable)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapTeacherFromDatabase(data))
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()
  const payload = (await request.json()) as Partial<Teacher>
  let sanitizedPayload = mapTeacherToDatabase(sanitizeTeacherPayload(payload))

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from(teachersTable)
      .update(sanitizedPayload)
      .eq("id", id)
      .select("*")
      .single()

    if (!error) {
      return NextResponse.json(mapTeacherFromDatabase(data))
    }

    const missingColumn = extractMissingColumnFromError(error.message)

    if (!missingColumn || !(missingColumn in sanitizedPayload)) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    sanitizedPayload = removeColumnFromPayload(sanitizedPayload, missingColumn)
  }

  return NextResponse.json(
    { error: "Failed to update teacher after filtering unknown columns" },
    { status: 500 },
  )
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from(teachersTable).delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
