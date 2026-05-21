import { DataType } from "@/types/dataType"

type DataTypePayload = Partial<DataType>

const STRING_FIELDS: (keyof DataType)[] = [
  "name",
  "short",
]

const normalizeString = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const sanitizeDataTypePayload = (
  payload: DataTypePayload,
): DataTypePayload => {
  const sanitized: DataTypePayload = {}

  for (const field of STRING_FIELDS) {
    const normalized = normalizeString(payload[field])

    if (normalized !== undefined) {
      sanitized[field] = normalized as never
    }
  }

  return sanitized
}

export const hasDataTypeRequiredFields = (payload: DataTypePayload) => {
  const name = normalizeString(payload.name)
  return typeof name === "string" && name.length > 0
}

export const parseMissingDataTypeColumn = (message?: string | null) => {
  if (!message) return null
  const match = message.match(/Could not find the '([^']+)' column/i)
  return match?.[1] ?? null
}

export const removeUnknownDataTypeColumns = (
  payload: Record<string, unknown>,
  missingColumns: Set<string>,
) => {
  if (!missingColumns.size) return payload

  const allowed = ["name", "short"]
  const next: Record<string, unknown> = {}

  for (const key of allowed) {
    if (missingColumns.has(key)) continue
    if (payload[key] !== undefined) {
      next[key] = payload[key]
    }
  }

  return next
}