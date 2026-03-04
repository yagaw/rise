"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import TextArea from "@/components/form/input/TextArea"
import Button from "@/components/ui/button/Button"
import { DataYear } from "@/types/dataYear"

export default function AddDataYearPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<DataYear>>({})

  const handleInputChange = (field: keyof DataYear, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/data_year", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to create Data Year")
      }

      alert("Data Year added successfully!")
      router.push("/data_year")
    } catch (error) {
      console.error(error)
      alert("Failed to add Data Year")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Data Year" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter title"
                onChange={(event) =>
                  handleInputChange("title", event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                onChange={(event) =>
                  handleInputChange("start_date", event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                onChange={(event) =>
                  handleInputChange("end_date", event.target.value)
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="remark">Remark</Label>
              <TextArea
                id="remark"
                rows={4}
                value={formData.remark || ""}
                onChange={(value) => handleInputChange("remark", value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Data Year"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/data_year")}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
