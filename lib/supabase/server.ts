import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const schoolsTable = process.env.SUPABASE_SCHOOLS_TABLE || "sp_ease"
export const teachersTable = process.env.SUPABASE_TEACHERS_TABLE || "tp_ease"
export const schoolQleTable =
  process.env.SUPABASE_SCHOOL_QLE_TABLE || "qle_ease"
export const eccdTable = process.env.SUPABASE_ECCD_TABLE || "eccd_ease"
export const teesTable = process.env.SUPABASE_TEES_TABLE || "tees_ease"
export const dataYearTable = process.env.SUPABASE_DATA_YEAR_TABLE || "data_year"
export const dataTypeTable = process.env.SUPABASE_DATA_TYPE_TABLE || "data_type"
export const organizationsTable =
  process.env.SUPABASE_ORGANIZATIONS_TABLE || "organization"
export const riseUserTable = process.env.SUPABASE_RISE_USER_TABLE || "rise_user"
export const techerPositionTable = "techer_position"

export const createSupabaseServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable",
    )
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
