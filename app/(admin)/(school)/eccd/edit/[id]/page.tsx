"use client"
import React, { useState, useEffect } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { useRouter } from "next/navigation"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Button from "@/components/ui/button/Button"
import TextArea from "@/components/form/input/TextArea"

type EccdForm = {
  id: string
  org: string
  sch_code: string
  sch_name_eng: string
  std_id: string
  std_name_eng: string
  std_name_bur: string
  enroll_date: string
  sex: string
  dob: string
  remark: string
}

// Mock data - replace with actual API call
const getEccdById = (id: string): EccdForm => {
  return {
    id: id,
    org: "SEE",
    sch_code: "SEE001",
    sch_name_eng: "SEE Early Center 1",
    std_id: "STD-0001",
    std_name_eng: "Aung Kyaw",
    std_name_bur: "အောင်ကျော်",
    enroll_date: "2025-09-01",
    sex: "male",
    dob: "2021-03-10",
    remark: "Example",
  }
}

export default function EditEccdPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<Partial<EccdForm>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch ECCD data
    const eccdData = getEccdById(params.id)
    setFormData(eccdData)
    setLoading(false)
  }, [params.id])

  const handleInputChange = (field: keyof EccdForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // TODO: Add API call to update ECCD student
    alert("ECCD student updated successfully!")
    router.push("/eccd")
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "school", label: "School Information" },
    { id: "additional", label: "Additional Details" },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit ECCD Student" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="std_id">Student ID *</Label>
                <Input
                  id="std_id"
                  type="text"
                  placeholder="Enter student ID"
                  defaultValue={formData.std_id}
                  onChange={(e) => handleInputChange("std_id", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="std_name_eng">Student Name (English) *</Label>
                <Input
                  id="std_name_eng"
                  type="text"
                  placeholder="Enter student name in English"
                  defaultValue={formData.std_name_eng}
                  onChange={(e) =>
                    handleInputChange("std_name_eng", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="std_name_bur">Student Name (Burmese)</Label>
                <Input
                  id="std_name_bur"
                  type="text"
                  placeholder="Enter student name in Burmese"
                  defaultValue={formData.std_name_bur}
                  onChange={(e) =>
                    handleInputChange("std_name_bur", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sex">Gender</Label>
                <Select
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  placeholder="Select gender"
                  defaultValue={formData.sex}
                  onChange={(value) => handleInputChange("sex", value)}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  placeholder="Enter date of birth"
                  defaultValue={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="enroll_date">Enrollment Date</Label>
                <Input
                  id="enroll_date"
                  type="date"
                  placeholder="Enter enrollment date"
                  defaultValue={formData.enroll_date}
                  onChange={(e) =>
                    handleInputChange("enroll_date", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* School Information Tab */}
          {activeTab === "school" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="org">Organization</Label>
                <Input
                  id="org"
                  type="text"
                  placeholder="Enter organization"
                  defaultValue={formData.org}
                  onChange={(e) => handleInputChange("org", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sch_code">School Code</Label>
                <Input
                  id="sch_code"
                  type="text"
                  placeholder="Enter school code"
                  defaultValue={formData.sch_code}
                  onChange={(e) =>
                    handleInputChange("sch_code", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sch_name_eng">School Name (English)</Label>
                <Input
                  id="sch_name_eng"
                  type="text"
                  placeholder="Enter school name in English"
                  defaultValue={formData.sch_name_eng}
                  onChange={(e) =>
                    handleInputChange("sch_name_eng", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Additional Details Tab */}
          {activeTab === "additional" && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="remark">Remark</Label>
                <TextArea
                  id="remark"
                  placeholder="Enter any additional remarks"
                  rows={4}
                  value={formData.remark}
                  onChange={(value) => handleInputChange("remark", value)}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/eccd")}
            >
              Cancel
            </Button>
            <Button type="submit">Update ECCD Student</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
