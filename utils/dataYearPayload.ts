import { DataYear } from "@/types/dataYear"

type DataYearPayload = Partial<DataYear>

const STRING_FIELDS: (keyof DataYear)[] = [
  "title",
  "start_date",
  "end_date",
  "remark",
]

const normalizeString = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const sanitizeDataYearPayload = (
  payload: DataYearPayload,
): DataYearPayload => {
  const sanitized: DataYearPayload = {}

  for (const field of STRING_FIELDS) {
    const normalized = normalizeString(payload[field])

    if (normalized !== undefined) {
      sanitized[field] = normalized as never
    }
  }

  return sanitized
}

export const hasDataYearRequiredFields = (payload: DataYearPayload) => {
  const title = normalizeString(payload.title)
  return typeof title === "string" && title.length > 0
}

export const parseMissingDataYearColumn = (message?: string | null) => {
  if (!message) return null
  const match = message.match(/Could not find the '([^']+)' column/i)
  return match?.[1] ?? null
}

export const removeUnknownDataYearColumns = (
  payload: Record<string, unknown>,
  missingColumns: Set<string>,
) => {
  if (!missingColumns.size) return payload

  const allowed = ["title", "start_date", "end_date", "remark"]
  const next: Record<string, unknown> = {}

  for (const key of allowed) {
    if (missingColumns.has(key)) continue
    if (payload[key] !== undefined) {
      next[key] = payload[key]
    }
  }

  return next
}
