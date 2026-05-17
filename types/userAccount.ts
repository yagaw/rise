export const userAccountRoles = ["CRED"] as const

export type UserAccountRole = (typeof userAccountRoles)[number]
export type UserAccountOrganizationScope = "organization" | "all"

export interface UserAccountPermissions {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export interface CreateUserAccountPayload {
  email: string
  password: string
  displayName?: string
  role: UserAccountRole
  organizationScope: UserAccountOrganizationScope
  organizationId: string
  organizationTitle?: string
  permissions: UserAccountPermissions
}

export interface UpdateUserAccountPayload {
  email: string
  displayName?: string
  organizationScope: UserAccountOrganizationScope
  organizationId: string
  organizationTitle?: string
  permissions: UserAccountPermissions
}

export interface ChangeUserAccountPasswordPayload {
  password: string
}

export interface UserAccount {
  id: string
  email: string
  displayName: string
  role: UserAccountRole
  organizationScope: UserAccountOrganizationScope
  organizationId: string
  organizationTitle: string
  canManageAllOrganizations: boolean
  permissions: UserAccountPermissions
  createdAt: string | null
  lastSignInAt: string | null
}
