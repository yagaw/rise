import { SchoolQle } from "@/types/schoolQle"

type SchoolQlePayload = Partial<SchoolQle>

export const sanitizeSchoolQlePayload = (
  payload: SchoolQlePayload,
): SchoolQlePayload => {
  const sanitizedEntries = Object.entries(payload)
    .filter(
      ([key, value]) =>
        key !== "id" && key !== "created_at" && value !== undefined,
    )
    .map(([key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        return [key, null]
      }

      if (typeof value === "number" && Number.isNaN(value)) {
        return [key, null]
      }

      return [key, value]
    })

  return Object.fromEntries(sanitizedEntries)
}

export const extractMissingColumnFromError = (message?: string) => {
  if (!message) {
    return null
  }

  const match = message.match(/Could not find the '(.+)' column/i)
  if (!match?.[1]) {
    return null
  }

  return match[1]
}

export const removeColumnFromPayload = (
  payload: SchoolQlePayload,
  column: string,
): SchoolQlePayload => {
  const nextPayload = { ...payload } as Record<string, unknown>
  delete nextPayload[column]
  return nextPayload as SchoolQlePayload
}
