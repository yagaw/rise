"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import TextArea from "@/components/form/input/TextArea"
import { Organization } from "@/types/organization"

export default function AddOrganizationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})
  const [formData, setFormData] = useState<Partial<Organization>>({
    title: "",
    short_title: "",
    type: "",
    ethnicity: "",
    remark: "",
  })

  const handleInputChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { title?: string } = {}
    if (!formData.title?.trim()) newErrors.title = "Title is required."
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to create organization")
      }

      alert("Organization added successfully!")
      router.push("/organizations")
    } catch (error) {
      console.error(error)
      alert("Failed to add organization")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/organizations")
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Add Organization" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Organization
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create organization record in Supabase
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {isSubmitting && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-300">
                Saving organization data...
              </div>
            )}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Organization Fields
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter organization title"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      handleInputChange("title", e.target.value)
                      if (errors.title)
                        setErrors((prev) => ({ ...prev, title: undefined }))
                    }}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="short_title">Short Title</Label>
                  <Input
                    id="short_title"
                    type="text"
                    placeholder="Enter short title"
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
                    value={formData.remark ?? ""}
                    disabled={isSubmitting}
                    onChange={(value) => handleInputChange("remark", value)}
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
                  "Create Organization"
                )}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
