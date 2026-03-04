import { School } from "@/types/school"

type SchoolPayload = Partial<School>

export const sanitizeSchoolPayload = (
  payload: SchoolPayload,
): SchoolPayload => {
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
