"use client"

import React, { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Label from "@/components/form/Label"
import Checkbox from "@/components/form/input/Checkbox"
import Input from "@/components/form/input/InputField"
import Button from "@/components/ui/button/Button"
import { Organization } from "@/types/organization"
import {
  CreateUserAccountPayload,
  UserAccountPermissions,
  UserAccountOrganizationScope,
} from "@/types/userAccount"
import {
  defaultUserAccountPermissions,
  userAccountPermissionKeys,
} from "@/utils/userAccount"

const initialFormData: CreateUserAccountPayload = {
  email: "",
  password: "",
  displayName: "",
  role: "CRED",
  organizationScope: "organization",
  organizationId: "",
  organizationTitle: "",
  permissions: defaultUserAccountPermissions,
}

const organizationTitle = (organization: Organization) =>
  organization.title ||
  organization.short_title ||
  organization.name ||
  organization.longname ||
  organization.id

export default function AddUserAccountPage() {
  const router = useRouter()
  const [formData, setFormData] =
    useState<CreateUserAccountPayload>(initialFormData)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [errors, setErrors] = useState<
    Partial<Record<"email" | "password" | "organizationId", string>>
  >({})
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations")
        const data = (await response.json()) as Organization[] | { error?: string }

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error || "Failed to load organizations" : "",
          )
        }

        const nextOrganizations = Array.isArray(data) ? data : []
        setOrganizations(nextOrganizations)
        if (nextOrganizations[0]) {
          setFormData((current) => ({
            ...current,
            organizationId: current.organizationId || nextOrganizations[0].id,
            organizationTitle:
              current.organizationTitle || organizationTitle(nextOrganizations[0]),
          }))
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load organizations.",
        )
      }
    }

    fetchOrganizations()
  }, [])

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === formData.organizationId,
      ),
    [formData.organizationId, organizations],
  )

  const handleInputChange = (
    field: keyof CreateUserAccountPayload,
    value: string,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleOrganizationScopeChange = (
    organizationScope: UserAccountOrganizationScope,
  ) => {
    const nextOrganization = organizations[0]
    setFormData((current) => ({
      ...current,
      organizationScope,
      organizationId:
        organizationScope === "all"
          ? "all"
          : current.organizationId || nextOrganization?.id || "",
      organizationTitle:
        organizationScope === "all"
          ? "All Organizations"
          : selectedOrganization
          ? organizationTitle(selectedOrganization)
          : nextOrganization
          ? organizationTitle(nextOrganization)
          : "",
    }))
  }

  const handleOrganizationChange = (organizationId: string) => {
    const organization = organizations.find((item) => item.id === organizationId)
    setFormData((current) => ({
      ...current,
      organizationId,
      organizationTitle: organization ? organizationTitle(organization) : "",
    }))
    setErrors((current) => ({ ...current, organizationId: undefined }))
  }

  const handlePermissionChange = (
    permission: keyof UserAccountPermissions,
    checked: boolean,
  ) => {
    setFormData((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [permission]: checked,
      },
    }))
  }

  const validate = () => {
    const nextErrors: Partial<
      Record<"email" | "password" | "organizationId", string>
    > = {}

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required."
    }

    if (!formData.password) {
      nextErrors.password = "Password is required."
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters."
    }

    if (
      formData.organizationScope === "organization" &&
      !formData.organizationId
    ) {
      nextErrors.organizationId = "Organization is required."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("")

    if (!validate()) {
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/user-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user account")
      }

      router.push("/user-accounts")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create user account.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Add User Account" />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        {message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter display name"
              defaultValue={formData.displayName}
              onChange={(event) =>
                handleInputChange("displayName", event.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              defaultValue={formData.email}
              error={Boolean(errors.email)}
              hint={errors.email}
              onChange={(event) => handleInputChange("email", event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create password"
              defaultValue={formData.password}
              error={Boolean(errors.password)}
              hint={errors.password}
              onChange={(event) =>
                handleInputChange("password", event.target.value)
              }
            />
          </div>

        </div>

        <div className="mt-8 space-y-4">
          <Label>Organization Access</Label>
          <div className="flex flex-wrap gap-3">
            {(["organization", "all"] as UserAccountOrganizationScope[]).map(
              (scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => handleOrganizationScopeChange(scope)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    formData.organizationScope === scope
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {scope === "all" ? "All Organizations" : "One Organization"}
                </button>
              ),
            )}
          </div>

          {formData.organizationScope === "organization" && (
            <div>
              <select
                value={formData.organizationId}
                onChange={(event) => handleOrganizationChange(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Select organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organizationTitle(organization)}
                  </option>
                ))}
              </select>
              {errors.organizationId && (
                <p className="mt-1.5 text-xs text-error-500">
                  {errors.organizationId}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Label>Permissions</Label>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
            {userAccountPermissionKeys.map((permission) => (
              <Checkbox
                key={permission}
                label={permission}
                checked={formData.permissions[permission]}
                onChange={(checked) =>
                  handlePermissionChange(permission, checked)
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/user-accounts")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create User Account
          </Button>
        </div>
      </form>
    </div>
  )
}
