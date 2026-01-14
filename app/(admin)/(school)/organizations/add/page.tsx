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
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: "",
    longname: "",
    remark: "",
  })

  const handleInputChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Replace with actual API call
    const newOrganization: Organization = {
      id: `org-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...formData,
    }

    console.log("Creating organization:", newOrganization)

    // Redirect to organizations list
    router.push("/organizations")
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
            Create a new education organization
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter organization name"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="longname">Long Name</Label>
                  <Input
                    id="longname"
                    type="text"
                    placeholder="Enter full organization name"
                    onChange={(e) =>
                      handleInputChange("longname", e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="remark">Remark</Label>
                  <TextArea
                    placeholder="Enter any additional remarks"
                    rows={4}
                    onChange={(value) => handleInputChange("remark", value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button>Create Organization</Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
