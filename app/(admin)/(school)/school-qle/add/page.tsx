"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Button from "@/components/ui/button/Button"
import { SchoolQle } from "@/types/schoolQle"
import { DataYear } from "@/types/dataYear"

const qleIndicators: Array<keyof SchoolQle> = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
]

export default function AddSchoolQlePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [formData, setFormData] = useState<Partial<SchoolQle>>({})

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

  const parseNumericInput = (value: string): number | "" => {
    if (value.trim() === "") {
      return ""
    }

    const parsed = Number(value)
    return Number.isNaN(parsed) ? "" : parsed
  }

  const handleInputChange = (
    field: keyof SchoolQle,
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

      const response = await fetch("/api/school-qle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        alert(errorData.error || "Failed to create School QLE record")
        return
      }

      alert("School QLE record added successfully!")
      router.push("/school-qle")
    } catch (error) {
      alert("Failed to add School QLE record")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add School QLE" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Form onSubmit={handleSubmit}>
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
              <Label htmlFor="sch_code">School Code *</Label>
              <Input
                id="sch_code"
                type="text"
                placeholder="Enter school code"
                onChange={(e) => handleInputChange("sch_code", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sch_name_eng">School Name (English) *</Label>
              <Input
                id="sch_name_eng"
                type="text"
                placeholder="Enter school name"
                onChange={(e) =>
                  handleInputChange("sch_name_eng", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="sr_eng_minu">State/Region</Label>
              <Input
                id="sr_eng_minu"
                type="text"
                placeholder="Enter state/region"
                onChange={(e) =>
                  handleInputChange("sr_eng_minu", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="ts_eng_mimu">Township</Label>
              <Input
                id="ts_eng_mimu"
                type="text"
                placeholder="Enter township"
                onChange={(e) =>
                  handleInputChange("ts_eng_mimu", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="sch_type">School Type</Label>
              <Select
                options={[
                  { value: "Government", label: "Government" },
                  { value: "Private", label: "Private" },
                  { value: "Monastery", label: "Monastery" },
                  { value: "Community", label: "Community" },
                ]}
                placeholder="Select school type"
                onChange={(value) => handleInputChange("sch_type", value)}
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              QLE Indicators (A-S)
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {qleIndicators.map((indicator) => {
                const inputId = `qle-${indicator}`
                return (
                  <div key={indicator}>
                    <Label htmlFor={inputId} className="uppercase">
                      {indicator}
                    </Label>
                    <Input
                      id={inputId}
                      type="number"
                      placeholder="0"
                      onChange={(e) =>
                        handleInputChange(
                          indicator,
                          parseNumericInput(e.target.value),
                        )
                      }
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/school-qle")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save QLE Record"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
