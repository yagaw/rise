import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "../../auth"
import { ChangeUserAccountPasswordPayload } from "@/types/userAccount"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const payload =
    (await request.json()) as Partial<ChangeUserAccountPasswordPayload>
  const password = payload.password

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    )
  }

  if (id === "me") {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  const { adminSupabase, errorResponse } = await requireSuperAdmin()
  if (errorResponse || !adminSupabase) {
    return errorResponse
  }

  const { error } = await adminSupabase.auth.admin.updateUserById(id, {
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
