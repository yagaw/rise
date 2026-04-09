import { Organization } from "@/types/organization"

type OrganizationPayload = Partial<Organization>
type SanitizeOrganizationPayloadOptions = {
  includeSystemFields?: boolean
}

const normalizeString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const sanitizeOrganizationPayload = (
  payload: OrganizationPayload,
  options: SanitizeOrganizationPayloadOptions = {},
): OrganizationPayload => {
  const { includeSystemFields = false } = options
  const sanitized: OrganizationPayload = {}

  if (includeSystemFields) {
    const id = normalizeString(payload.id)
    if (id !== undefined && typeof id === "string") {
      sanitized.id = id
    }

    const createdAt = normalizeString(payload.created_at)
    if (createdAt !== undefined && typeof createdAt === "string") {
      sanitized.created_at = createdAt
    }
  }

  const title = normalizeString(payload.title ?? payload.name)
  if (title !== undefined) {
    sanitized.title = title
  }

  const shortTitle = normalizeString(payload.short_title ?? payload.longname)
  if (shortTitle !== undefined) {
    sanitized.short_title = shortTitle
  }

  const remark = normalizeString(payload.remark)
  if (remark !== undefined) {
    sanitized.remark = remark
  }

  const type = normalizeString(payload.type)
  if (type !== undefined) {
    sanitized.type = type
  }

  const ethnicity = normalizeString(payload.ethnicity)
  if (ethnicity !== undefined) {
    sanitized.ethnicity = ethnicity
  }

  return sanitized
}
