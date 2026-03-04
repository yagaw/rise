"use client"
import React, { useState, useEffect } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { useRouter } from "next/navigation"
import { EccdStudent } from "@/types/eccdStudent"
import { DataYear } from "@/types/dataYear"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Button from "@/components/ui/button/Button"

export default function EditEccdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [formData, setFormData] = useState<Partial<EccdStudent>>({})
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchEccdStudent = async () => {
      try {
        const response = await fetch(`/api/eccd/${id}`)

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          throw new Error(errorData.error || "Failed to fetch ECCD student")
        }

        const data = (await response.json()) as EccdStudent
        setFormData(data)
      } catch (error) {
        console.error(error)
        alert("Failed to load ECCD student")
        router.push("/eccd")
      } finally {
        setLoading(false)
      }
    }

    fetchEccdStudent()
  }, [id, router])

  const handleInputChange = (
    field: keyof EccdStudent,
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

      const response = await fetch(`/api/eccd/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to update ECCD student")
      }

      alert("ECCD student updated successfully!")
      router.push("/eccd")
    } catch (error) {
      console.error(error)
      alert("Failed to update ECCD student")
    } finally {
      setIsSubmitting(false)
    }
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
    { id: "additional", label: "Location & Grade" },
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
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
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
                  defaultValue={formData.dob || ""}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
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
                <Label htmlFor="data_year">Data Year</Label>
                <Select
                  options={dataYears.map((item) => ({
                    value: item.id,
                    label: item.title || item.id,
                  }))}
                  placeholder="Select data year"
                  defaultValue={formData.data_year}
                  onChange={(value) => handleInputChange("data_year", value)}
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
              <div>
                <Label htmlFor="sch_status">School Status</Label>
                <Input
                  id="sch_status"
                  type="text"
                  placeholder="Enter school status"
                  defaultValue={formData.sch_status}
                  onChange={(e) =>
                    handleInputChange("sch_status", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Additional Details Tab */}
          {activeTab === "additional" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="sr_eng_mimu">State/Region (English)</Label>
                <Input
                  id="sr_eng_mimu"
                  type="text"
                  placeholder="Enter state/region"
                  defaultValue={formData.sr_eng_mimu}
                  onChange={(e) =>
                    handleInputChange("sr_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="ts_eng_mimu">Township (English)</Label>
                <Input
                  id="ts_eng_mimu"
                  type="text"
                  placeholder="Enter township"
                  defaultValue={formData.ts_eng_mimu}
                  onChange={(e) =>
                    handleInputChange("ts_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_25_26">Grade (25-26)</Label>
                <Input
                  id="grade_25_26"
                  type="text"
                  placeholder="Enter grade"
                  defaultValue={formData.grade_25_26}
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
              onClick={() => router.push("/eccd")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update ECCD Student"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
