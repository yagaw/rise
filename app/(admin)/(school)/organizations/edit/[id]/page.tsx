"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import TextArea from "@/components/form/input/TextArea"
import { Organization } from "@/types/organization"

export default function EditOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const [formData, setFormData] = useState<Partial<Organization>>({
    title: "",
    short_title: "",
    type: "",
    ethnicity: "",
    remark: "",
  })
  const [remarkValue, setRemarkValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}`)

        if (!response.ok) {
          throw new Error("Failed to load organization")
        }

        const organization = (await response.json()) as Organization
        setFormData({
          title: organization.title || "",
          short_title: organization.short_title || "",
          type: organization.type || "",
          ethnicity: organization.ethnicity || "",
          remark: organization.remark || "",
        })
        setRemarkValue(organization.remark || "")
      } catch (error) {
        console.error(error)
        alert("Failed to load organization")
        router.push("/organizations")
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [organizationId, router])

  const handleInputChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to update organization")
      }

      alert("Organization updated successfully!")
      router.push("/organizations")
    } catch (error) {
      console.error(error)
      alert("Failed to update organization")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/organizations")
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          <p>Loading organization details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Edit Organization" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Organization
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update organization information in Supabase
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {isSubmitting && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-300">
                Saving organization changes...
              </div>
            )}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Organization Fields
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="id">ID</Label>
                  <Input
                    id="id"
                    type="text"
                    defaultValue={organizationId}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter organization title"
                    defaultValue={formData.title}
                    disabled={isSubmitting}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="short_title">Short Title</Label>
                  <Input
                    id="short_title"
                    type="text"
                    placeholder="Enter short title"
                    defaultValue={formData.short_title}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleInputChange("short_title", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    disabled={isSubmitting}
                    value={formData.type ?? ""}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="Member">Member</option>
                    <option value="Strategic partner">Strategic partner</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Input
                    id="ethnicity"
                    type="text"
                    placeholder="Enter ethnicity"
                    defaultValue={formData.ethnicity}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleInputChange("ethnicity", e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="remark">Remark</Label>
                  <TextArea
                    id="remark"
                    placeholder="Enter any additional remarks"
                    rows={4}
                    value={remarkValue}
                    disabled={isSubmitting}
                    onChange={(value) => {
                      setRemarkValue(value)
                      handleInputChange("remark", value)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                    Saving...
                  </span>
                ) : (
                  "Update Organization"
                )}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
