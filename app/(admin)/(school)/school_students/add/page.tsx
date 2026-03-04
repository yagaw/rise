"use client"
import React, { useEffect, useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { useRouter } from "next/navigation"
import { TeesStudent } from "@/types/teesStudent"
import { DataYear } from "@/types/dataYear"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Button from "@/components/ui/button/Button"

export default function AddSchoolStudentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [formData, setFormData] = useState<Partial<TeesStudent>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchDataYears = async () => {
      try {
        const response = await fetch("/api/data_year")
        if (!response.ok) return
        const data = (await response.json()) as DataYear[]
        setDataYears(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchDataYears()
  }, [])

  const handleInputChange = (
    field: keyof TeesStudent,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/tees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to create TEE student")
      }

      alert("TEE student added successfully!")
      router.push("/school_students")
    } catch (error) {
      console.error(error)
      alert("Failed to add TEE student")
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "school", label: "School Information" },
    { id: "academic", label: "Academic History" },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Add TEES Student" />

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
                  onChange={(e) => handleInputChange("std_id", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="std_name_eng">Student Name (English) *</Label>
                <Input
                  id="std_name_eng"
                  type="text"
                  placeholder="Enter student name in English"
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
                  onChange={(e) =>
                    handleInputChange("std_name_bur", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sex">Gender</Label>
                <Select
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  placeholder="Select gender"
                  onChange={(value) => handleInputChange("sex", value)}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  placeholder="Enter date of birth"
                  defaultValue={formData.dob || ""}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  defaultValue={
                    formData.age === undefined ? "" : String(formData.age)
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "age",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="enroll_date">Enrollment Date</Label>
                <Input
                  id="enroll_date"
                  type="date"
                  placeholder="Enter enrollment date"
                  defaultValue={formData.enroll_date || ""}
                  onChange={(e) =>
                    handleInputChange("enroll_date", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="year_tees_std_began">
                  Year TEES Student Began
                </Label>
                <Input
                  id="year_tees_std_began"
                  type="number"
                  placeholder="Enter year student began at TEES"
                  defaultValue={
                    formData.year_tees_std_began === undefined
                      ? ""
                      : String(formData.year_tees_std_began)
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "year_tees_std_began",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
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
                  onChange={(e) => handleInputChange("org", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_year">Data Year</Label>
                <Select
                  options={dataYears.map((item) => ({
                    value: item.id,
                    label: item.title || item.id,
                  }))}
                  placeholder="Select data year"
                  onChange={(value) => handleInputChange("data_year", value)}
                />
              </div>
              <div>
                <Label htmlFor="sch_code">School Code</Label>
                <Input
                  id="sch_code"
                  type="text"
                  placeholder="Enter school code"
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
                  onChange={(e) =>
                    handleInputChange("sch_name_eng", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sch_status">School Status</Label>
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Pending", label: "Pending" },
                  ]}
                  placeholder="Select school status"
                  onChange={(value) => handleInputChange("sch_status", value)}
                />
              </div>
              <div>
                <Label htmlFor="sr_eng_mimu">State/Region (English)</Label>
                <Input
                  id="sr_eng_mimu"
                  type="text"
                  placeholder="Enter state/region in English"
                  onChange={(e) =>
                    handleInputChange("sr_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ts_eng_mimu">Township (English)</Label>
                <Input
                  id="ts_eng_mimu"
                  type="text"
                  placeholder="Enter township in English"
                  onChange={(e) =>
                    handleInputChange("ts_eng_mimu", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Academic History Tab */}
          {activeTab === "academic" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <Label htmlFor="grade_25_26">Grade (2025-2026)</Label>
                <Input
                  id="grade_25_26"
                  type="text"
                  placeholder="Enter grade for 2025-2026"
                  onChange={(e) =>
                    handleInputChange("grade_25_26", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push("/school_students")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save TEES Student"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
