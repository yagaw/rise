import { EccdStudent } from "@/types/eccdStudent"

const ECCD_FIELDS: (keyof EccdStudent)[] = [
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
]

const STRING_FIELDS: (keyof EccdStudent)[] = [
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

const NUMBER_FIELDS: (keyof EccdStudent)[] = ["age"]

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

export const sanitizeEccdPayload = (input: Partial<EccdStudent>) => {
  const payload: Partial<EccdStudent> = {}

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

export const hasEccdRequiredFields = (input: Partial<EccdStudent>) => {
  return Boolean(
    toNormalizedString(input.std_id) && toNormalizedString(input.std_name_eng),
  )
}

export const parseMissingColumnFromError = (message?: string | null) => {
  if (!message) return null
  const match = message.match(/Could not find the '([^']+)' column/i)
  return match?.[1] ?? null
}

export const removeUnknownEccdColumns = (
  payload: Partial<EccdStudent>,
  missingColumns: Set<string>,
) => {
  if (!missingColumns.size) return payload

  const next = {} as Record<string, unknown>

  for (const field of ECCD_FIELDS) {
    if (missingColumns.has(field)) continue
    if (payload[field] !== undefined) {
      next[field] = payload[field]
    }
  }

  return next as Partial<EccdStudent>
}
