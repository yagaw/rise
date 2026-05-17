"use client"

import React, { FormEvent, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Label from "@/components/form/Label"
import Checkbox from "@/components/form/input/Checkbox"
import Input from "@/components/form/input/InputField"
import Button from "@/components/ui/button/Button"
import { Organization } from "@/types/organization"
import {
  UpdateUserAccountPayload,
  UserAccount,
  UserAccountPermissions,
  UserAccountOrganizationScope,
} from "@/types/userAccount"
import {
  emptyUserAccountPermissions,
  userAccountPermissionKeys,
} from "@/utils/userAccount"

const organizationTitle = (organization: Organization) =>
  organization.title ||
  organization.short_title ||
  organization.name ||
  organization.longname ||
  organization.id

export default function EditUserAccountPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params.id
  const [formData, setFormData] = useState<UpdateUserAccountPayload>({
    email: "",
    displayName: "",
    organizationScope: "organization",
    organizationId: "",
    organizationTitle: "",
    permissions: emptyUserAccountPermissions,
  })
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, organizationsResponse] = await Promise.all([
          fetch(`/api/user-accounts/${userId}`),
          fetch("/api/organizations"),
        ])
        const userData = (await userResponse.json()) as UserAccount | {
          error?: string
        }
        const organizationsData =
          (await organizationsResponse.json()) as Organization[] | {
            error?: string
          }

        if (!userResponse.ok) {
          throw new Error(
            "error" in userData
              ? userData.error || "Failed to load user account"
              : "",
          )
        }

        if (!organizationsResponse.ok) {
          throw new Error(
            "error" in organizationsData
              ? organizationsData.error || "Failed to load organizations"
              : "",
          )
        }

        const account = userData as UserAccount
        setFormData({
          email: account.email,
          displayName: account.displayName,
          organizationScope: account.organizationScope,
          organizationId: account.organizationId,
          organizationTitle: account.organizationTitle,
          permissions: account.permissions,
        })
        setOrganizations(Array.isArray(organizationsData) ? organizationsData : [])
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Failed to load user account.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === formData.organizationId,
      ),
    [formData.organizationId, organizations],
  )

  const handleInputChange = (
    field: keyof UpdateUserAccountPayload,
    value: string,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }))
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
          : current.organizationId === "all"
          ? nextOrganization?.id || ""
          : current.organizationId,
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("")

    if (!formData.email.trim() || !formData.organizationId) {
      setMessage("Email and organization access are required.")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/user-accounts/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user account")
      }

      router.push("/user-accounts")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update user account.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Loading user account...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Edit User Account" />

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
              key={`displayName-${formData.displayName}`}
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
              key={`email-${formData.email}`}
              type="email"
              placeholder="name@example.com"
              defaultValue={formData.email}
              onChange={(event) => handleInputChange("email", event.target.value)}
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
