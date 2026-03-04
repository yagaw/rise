import { Teacher } from "@/types/teacher"

type TeacherPayload = Partial<Teacher>
type TeacherRecord = Record<string, unknown>

const gradeFieldMap = {
  grade_1: "g1",
  grade_2: "g2",
  grade_3: "g3",
  grade_4: "g4",
  grade_5: "g5",
  grade_6: "g6",
  grade_7: "g7",
  grade_8: "g8",
  grade_9: "g9",
  grade_10: "g10",
  grade_11: "g11",
  grade_12: "g12",
} as const

export const sanitizeTeacherPayload = (
  payload: TeacherPayload,
): TeacherPayload => {
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
  payload: TeacherPayload,
  column: string,
): TeacherPayload => {
  const nextPayload = { ...payload } as Record<string, unknown>
  delete nextPayload[column]
  return nextPayload as TeacherPayload
}

export const mapTeacherToDatabase = (payload: TeacherPayload) => {
  const mappedPayload: TeacherRecord = { ...payload }

  Object.entries(gradeFieldMap).forEach(([uiField, dbField]) => {
    if (uiField in mappedPayload) {
      mappedPayload[dbField] = mappedPayload[uiField]
      delete mappedPayload[uiField]
    }
  })

  return mappedPayload
}

export const mapTeacherFromDatabase = (record: TeacherRecord | null) => {
  if (!record) {
    return record
  }

  const mappedRecord: TeacherRecord = { ...record }

  Object.entries(gradeFieldMap).forEach(([uiField, dbField]) => {
    if (dbField in mappedRecord) {
      mappedRecord[uiField] = mappedRecord[dbField]
    }
  })

  return mappedRecord
}
