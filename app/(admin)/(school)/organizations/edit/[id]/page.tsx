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

// Mock function to get organization by ID
const getOrganizationById = (id: string): Organization | null => {
  const mockOrganizations: Organization[] = [
    {
      id: "SEE",
      name: "SEE",
      longname: "Save the Earth and Education",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "STF",
      name: "STF",
      longname: "Save the Future",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "KTWG",
      name: "KTWG",
      longname: "Karen Teacher Working Group",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "SENG",
      name: "SENG",
      longname: "SENG Organization",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "TEI",
      name: "TEI",
      longname: "Teacher Education Initiative",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "CDN",
      name: "CDN",
      longname: "Community Development Network",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "BF",
      name: "BF",
      longname: "Border Foundation",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "CRED",
      name: "CRED",
      longname: "Community Resource and Education Development",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "DDI",
      name: "DDI",
      longname: "Development and Democracy Initiative",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "ENDO",
      name: "ENDO",
      longname: "Education Network Development Organization",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "LHM",
      name: "LHM",
      longname: "Learning and Hope Mission",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "LDN",
      name: "LDN",
      longname: "Learning and Development Network",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
    {
      id: "TSYU",
      name: "TSYU",
      longname: "Teacher Support and Youth Upliftment",
      remark: "Education organization",
      created_at: new Date().toISOString(),
    },
  ]

  return mockOrganizations.find((org) => org.id === id) || null
}

export default function EditOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const [formData, setFormData] = useState<Partial<Organization>>({
    name: "",
    longname: "",
    remark: "",
  })
  const [remarkValue, setRemarkValue] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call
    const organization = getOrganizationById(organizationId)
    if (organization) {
      setFormData({
        name: organization.name || "",
        longname: organization.longname || "",
        remark: organization.remark || "",
      })
      setRemarkValue(organization.remark || "")
    }
    setLoading(false)
  }, [organizationId])

  const handleInputChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Replace with actual API call
    const updatedOrganization: Organization = {
      id: organizationId,
      created_at: new Date().toISOString(),
      ...formData,
    }

    console.log("Updating organization:", updatedOrganization)

    // Redirect to organizations list
    router.push("/organizations")
  }

  const handleCancel = () => {
    router.push("/organizations")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
            Update organization information
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
                    defaultValue={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="longname">Long Name</Label>
                  <Input
                    id="longname"
                    type="text"
                    placeholder="Enter full organization name"
                    defaultValue={formData.longname}
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
                    value={remarkValue}
                    onChange={(value) => {
                      setRemarkValue(value)
                      handleInputChange("remark", value)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button>Update Organization</Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
