import { TeesStudent } from "@/types/teesStudent"

const TEE_FIELDS: (keyof TeesStudent)[] = [
  "data_year",
  "org",
  "sch_code",
  "sch_status",
  "sch_name_eng",
  "sr_eng_mimu",
  "ts_eng_mimu",
  "std_id",
  "std_name_eng",
  "std_name_bur",
  "enroll_date",
  "grade_25_26",
  "sex",
  "dob",
  "age",
  "year_tees_std_began",
]

const STRING_FIELDS: (keyof TeesStudent)[] = [
  "data_year",
  "org",
  "sch_code",
  "sch_status",
  "sch_name_eng",
  "sr_eng_mimu",
  "ts_eng_mimu",
  "std_id",
  "std_name_eng",
  "std_name_bur",
  "enroll_date",
  "grade_25_26",
  "sex",
  "dob",
]

const NUMBER_FIELDS: (keyof TeesStudent)[] = ["age", "year_tees_std_began"]

const toNormalizedString = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const toNormalizedNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return undefined
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const sanitizeTeesPayload = (input: Partial<TeesStudent>) => {
  const payload: Partial<TeesStudent> = {}

  for (const field of STRING_FIELDS) {
    const normalized = toNormalizedString(input[field])
    if (normalized !== undefined) {
      payload[field] = normalized as never
    }
  }

  for (const field of NUMBER_FIELDS) {
    const normalized = toNormalizedNumber(input[field])
    if (normalized !== undefined) {
      payload[field] = normalized as never
    }
  }

  return payload
}

export const hasTeesRequiredFields = (input: Partial<TeesStudent>) => {
  return Boolean(
    toNormalizedString(input.std_id) && toNormalizedString(input.std_name_eng),
  )
}

export const mapTeesToDatabase = (payload: Partial<TeesStudent>) => {
  const { grade_25_26, ...rest } = payload

  const mapped: Record<string, unknown> = {
    ...rest,
  }

  if (grade_25_26 !== undefined) {
    mapped["grade_25-26"] = grade_25_26
  }

  return mapped
}

export const mapTeesFromDatabase = (record: Record<string, unknown>) => {
  const { ["grade_25-26"]: grade2526, ...rest } = record

  return {
    ...rest,
    grade_25_26: typeof grade2526 === "string" ? grade2526 : undefined,
  } as TeesStudent
}

export const parseMissingColumnFromError = (message?: string | null) => {
  if (!message) return null
  const match = message.match(/Could not find the '([^']+)' column/i)
  return match?.[1] ?? null
}

export const removeUnknownTeesColumns = (
  payload: Record<string, unknown>,
  missingColumns: Set<string>,
) => {
  if (!missingColumns.size) return payload

  const next: Record<string, unknown> = {}

  const dbAllowed = TEE_FIELDS.flatMap((field) =>
    field === "grade_25_26" ? ["grade_25-26"] : [field],
  )

  for (const field of dbAllowed) {
    if (missingColumns.has(field)) continue
    if (payload[field] !== undefined) {
      next[field] = payload[field]
    }
  }

  return next
}
