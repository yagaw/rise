import type { SupabaseClient } from "@supabase/supabase-js"
import { riseUserTable } from "@/lib/supabase/server"
import {
  RiseUserProfile,
  UserAccountOrganizationScope,
  UserAccountPermissions,
} from "@/types/userAccount"

type UserProfileInput = {
  userId: string
  organizationId?: string | null
  organizationScope: UserAccountOrganizationScope
  permissions: UserAccountPermissions
}

type RiseUserPayload = Record<string, unknown> & {
  user_id: string
}

function isRecoverableProfileSchemaError(error: { message?: string; code?: string }) {
  const message = error.message?.toLowerCase() ?? ""

  return (
    error.code === "PGRST204" ||
    message.includes("schema cache") ||
    message.includes("column") ||
    message.includes("could not find")
  )
}

function buildRiseUserPayloads({
  userId,
  organizationId,
  organizationScope,
  permissions,
}: UserProfileInput): RiseUserPayload[] {
  if (organizationScope === "all") {
    return [
      {
        user_id: userId,
        organization_id: null,
        can_create: permissions.create,
        can_read: permissions.read,
        can_update: permissions.update,
        can_delete: permissions.delete,
      },
      {
        user_id: userId,
        organization_id: null,
        create: permissions.create,
        read: permissions.read,
        update: permissions.update,
        delete: permissions.delete,
      },
      {
        user_id: userId,
        organization_id: null,
        permissions,
      },
      {
        user_id: userId,
        can_create: permissions.create,
        can_read: permissions.read,
        can_update: permissions.update,
        can_delete: permissions.delete,
      },
      {
        user_id: userId,
        create: permissions.create,
        read: permissions.read,
        update: permissions.update,
        delete: permissions.delete,
      },
      {
        user_id: userId,
        permissions,
      },
    ]
  }

  return [
    // Primary: with organization_id + can_* columns
    {
      user_id: userId,
      organization_id: organizationId,
      can_create: permissions.create,
      can_read: permissions.read,
      can_update: permissions.update,
      can_delete: permissions.delete,
    },
    // Fallback: with organization_id + bare column names
    {
      user_id: userId,
      organization_id: organizationId,
      create: permissions.create,
      read: permissions.read,
      update: permissions.update,
      delete: permissions.delete,
    },
    // Fallback: with organization_id + permissions JSON
    {
      user_id: userId,
      organization_id: organizationId,
      permissions,
    },
    // Fallback: without organization_id + can_* columns (schema cache miss)
    {
      user_id: userId,
      can_create: permissions.create,
      can_read: permissions.read,
      can_update: permissions.update,
      can_delete: permissions.delete,
    },
    // Fallback: without organization_id + bare column names
    {
      user_id: userId,
      create: permissions.create,
      read: permissions.read,
      update: permissions.update,
      delete: permissions.delete,
    },
    // Fallback: without organization_id + permissions JSON
    {
      user_id: userId,
      permissions,
    },
  ]
}

export async function getRiseUserProfile(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from(riseUserTable)
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load rise_user profile: ${error.message}`)
  }

  return (data ?? null) as RiseUserProfile | null
}

export async function listRiseUserProfiles(
  supabase: SupabaseClient,
  userIds: string[],
) {
  if (userIds.length === 0) return new Map<string, RiseUserProfile>()

  const { data, error } = await supabase
    .from(riseUserTable)
    .select("*")
    .in("user_id", userIds)

  if (error) {
    throw new Error(`Failed to load rise_user profiles: ${error.message}`)
  }

  return new Map(
    ((data ?? []) as RiseUserProfile[])
      .filter((row) => row.user_id)
      .map((row) => [String(row.user_id), row]),
  )
}

export async function upsertRiseUserProfile(
  supabase: SupabaseClient,
  input: UserProfileInput,
) {
  const existingProfile = await getRiseUserProfile(supabase, input.userId)
  const payloads = buildRiseUserPayloads(input)
  let lastError: { message?: string; code?: string } | null = null

  for (const payload of payloads) {
    const query = existingProfile
      ? supabase
          .from(riseUserTable)
          .update(payload)
          .eq("user_id", input.userId)
          .select("*")
          .single()
      : supabase.from(riseUserTable).insert(payload).select("*").single()
    const { data, error } = await query

    if (!error) {
      return data as RiseUserProfile
    }

    lastError = error

    if (!isRecoverableProfileSchemaError(error)) {
      break
    }
  }

  throw new Error(
    `Failed to save rise_user profile: ${
      lastError?.message || "Unknown database error."
    }`,
  )
}
